import os
from uuid import uuid4

import psycopg
from psycopg.conninfo import conninfo_to_dict, make_conninfo
import pytest


DATABASE_URL = os.getenv("POSTGRES_TEST_URL")
pytestmark = pytest.mark.skipif(not DATABASE_URL, reason="POSTGRES_TEST_URL not configured")


@pytest.fixture(scope="module")
def database():
    with psycopg.connect(DATABASE_URL, autocommit=True) as admin:
        admin.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public")
        schema = open("infra/schema.sql", encoding="utf-8").read()
        admin.execute(schema)
        admin.execute("DROP ROLE IF EXISTS multazim_rls_test")
        admin.execute("CREATE ROLE multazim_rls_test LOGIN PASSWORD 'rls_test' NOSUPERUSER NOBYPASSRLS")
        admin.execute("GRANT USAGE ON SCHEMA public TO multazim_rls_test")
        admin.execute("GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO multazim_rls_test")
        admin.execute("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO multazim_rls_test")
        org_a, org_b = uuid4(), uuid4()
        admin.execute("INSERT INTO organizations(id,name_ar,name_en,entity_type,sector) VALUES (%s,'أ','A','private','tech'),(%s,'ب','B','private','tech')", (org_a, org_b))
        for table, columns, values in [
            ("evidence", "id,organization_id,title,evidence_type,state,object_key,sha256,classification", (uuid4(), org_a, "A evidence", "pdf", "accepted", "a/file", "a" * 64, "internal")),
            ("gaps", "id,organization_id,description,severity,status", (uuid4(), org_a, "A gap", "high", "open")),
            ("documents", "id,organization_id,title_ar,title_en,document_type,owner,version,status", (uuid4(), org_a, "سياسة", "Policy", "policy", "owner", "1.0", "draft")),
            ("notifications", "id,organization_id,recipient_id,notification_type,title_ar,title_en,resource_type,resource_id,resource_url,severity", (uuid4(), org_a, "user-a", "gap_assigned", "فجوة", "Gap", "gap", "1", "/gaps", "high")),
        ]:
            placeholders = ",".join(["%s"] * len(values))
            admin.execute(f"INSERT INTO {table}({columns}) VALUES ({placeholders})", values)
    yield org_a, org_b
    with psycopg.connect(DATABASE_URL, autocommit=True) as admin:
        admin.execute("DROP OWNED BY multazim_rls_test")
        admin.execute("DROP ROLE IF EXISTS multazim_rls_test")


def tenant_connection():
    settings = conninfo_to_dict(DATABASE_URL)
    settings.update(user="multazim_rls_test", password="rls_test")
    return psycopg.connect(make_conninfo(**settings))


def test_rls_select_insert_update_delete_and_transaction_persistence(database):
    org_a, org_b = database
    with tenant_connection() as connection:
        connection.execute("SELECT set_config('app.organization_id', %s, false)", (str(org_b),))
        for table in ("evidence", "gaps", "documents", "notifications"):
            assert connection.execute(f"SELECT count(*) FROM {table}").fetchone()[0] == 0
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            connection.execute("INSERT INTO gaps(organization_id,description,severity,status) VALUES (%s,'cross tenant','high','open')", (org_a,))
        connection.rollback()
        connection.execute("SELECT set_config('app.organization_id', %s, false)", (str(org_a),))
        assert connection.execute("SELECT count(*) FROM evidence").fetchone()[0] == 1
        connection.execute("UPDATE gaps SET status='closed'")
        assert connection.execute("DELETE FROM notifications RETURNING id").fetchone()
        connection.commit()
    with tenant_connection() as connection:
        connection.execute("SELECT set_config('app.organization_id', %s, false)", (str(org_a),))
        assert connection.execute("SELECT status FROM gaps").fetchone()[0] == "closed"
        assert connection.execute("SELECT count(*) FROM notifications").fetchone()[0] == 0


def test_constraints_and_foreign_keys(database):
    org_a, _ = database
    with psycopg.connect(DATABASE_URL) as connection:
        with pytest.raises(psycopg.errors.CheckViolation):
            connection.execute("INSERT INTO documents(organization_id,title_ar,title_en,document_type,owner,version,status) VALUES (%s,'س','X','invalid','o','1','draft')", (org_a,))
        connection.rollback()
        with pytest.raises(psycopg.errors.ForeignKeyViolation):
            connection.execute("INSERT INTO assessments(organization_id,framework_version_id,title,state) VALUES (%s,%s,'x','draft')", (org_a, uuid4()))
