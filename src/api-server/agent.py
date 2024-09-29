from datetime import datetime
import sqlite3
from sqlite3 import Connection, Cursor
from typing import List, Dict, Tuple

from exceptions import DatabaseException
from config import settings

# Get a database connection and cursor. Ensures the agents table is created if it does not exist.
def _get_db_connection() -> Tuple[Connection, Cursor]:
    try:
        conn = sqlite3.connect(settings.database_url)
        cursor = conn.cursor()
        _create_table(cursor=cursor)
        return conn, cursor
    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Database connection error: {str(e)}")

# Create the agents table if it does not exist.
def _create_table(cursor: Cursor) -> None:
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            instructions TEXT,
            welcome_message TEXT,
            suggested_prompts TEXT,
            files TEXT,
            status TEXT,
            embeddings_status TEXT,
            created_on INTEGER,
            updated_on INTEGER
        )
        """
    )

# Convert a row from the database to a dictionary.
def row_to_dict(cursor: Cursor, row: tuple) -> Dict[str, str]:
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

# get all agents
def get_agents() -> List[Dict[str, str]]:
    try:
        conn, cursor = _get_db_connection()
        cursor.execute("SELECT * FROM agents")
        rows = cursor.fetchall()
        return [row_to_dict(cursor=cursor, row=row) for row in rows]

    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Error when getting agents: {str(e)}")
    finally:
        if conn:
            conn.close()

# insert a new agent record
def save_agent(
    name: str,
    instructions: str = "",
    welcome_message: str = "",
    suggested_prompts: str = "",
    files: str = ""
) -> Dict[str, str]:
    try:
        conn, cursor = _get_db_connection()

        # Check if an agent with the same name already exists
        cursor.execute("SELECT COUNT(1) FROM agents WHERE name = ?", (name,))
        if cursor.fetchone()[0] > 0:
            raise DatabaseException(detail=f"Agent: {name} already exists: {str(e)}")

        # get current time as an int
        now = int(datetime.now().timestamp())

        # Insert a new agent
        cursor.execute(
            """
            INSERT INTO agents (name, instructions, welcome_message, suggested_prompts, files, status, embeddings_status, created_on, updated_on)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (name, instructions, welcome_message, suggested_prompts, files, "", "", now, now),
        )

        conn.commit()

        # Retrieve the newly inserted agent data
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        row = cursor.fetchone()
        if row:
            return row_to_dict(cursor=cursor, row=row)
        else:
            raise DatabaseException(detail=f"Agent could not be retrieved after inserting: {str(e)}")
    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Agent could not be inserted: {str(e)}")
    finally:
        if conn:
            conn.close()

# update an agent record
def change_agent(
    name: str,
    instructions: str = "",
    welcome_message: str = "",
    suggested_prompts: str = "",
    files: str = "",
    embeddings_status: str = "",
) -> Dict[str, str]:
    try:
        conn, cursor = _get_db_connection()

        # Ensure the agent exists
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        if not cursor.fetchone():
            raise DatabaseException(detail=f"Agent: ${name} not found: {str(e)}")

        # time in int
        updated_on = int(datetime.now().timestamp())

        # Update the agent's fields except for `name` and `created_on`
        cursor.execute(
            """
            UPDATE agents
            SET instructions = COALESCE(?, instructions),
                welcome_message = COALESCE(?, welcome_message),
                suggested_prompts = COALESCE(?, suggested_prompts),
                files = COALESCE(?, files),
                embeddings_status = COALESCE(?, embeddings_status),
                updated_on = ?
            WHERE name = ?
            """,
            (instructions, welcome_message, suggested_prompts, files, embeddings_status, updated_on, name),
        )
        conn.commit()

        # Fetch the updated agent record
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        row = cursor.fetchone()
        if row:
            return row_to_dict(cursor=cursor, row=row)
        else:
            raise DatabaseException(detail=f"Agent updated could not be retrieved: {str(e)}")
    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Error in updating agent {name}: {str(e)}")
    finally:
        if conn:
            conn.close()

# update embedding_status
def update_agent_embeddings_status(name: str, embeddings_status: str = "") -> None:
    try:
        conn, cursor = _get_db_connection()

        # Ensure the agent exists
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        if not cursor.fetchone():
            raise DatabaseException(detail=f"Agent: ${name} not found in update embeddings status: {str(e)}")

        updated_on = int(datetime.now().timestamp())

        # Update the agent's fields except for `name` and `created_on`
        cursor.execute(
            """
            UPDATE agents
            SET embeddings_status = ?,
                updated_on = ?
            WHERE name = ?
            """,
            (embeddings_status, updated_on, name),
        )
        conn.commit()
    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Error in updating agent: {name}: {str(e)}")
    finally:
        if conn:
            conn.close()


def get_agent(name: str) -> Dict[str, str]:
    try:
        conn, cursor = _get_db_connection()
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        row = cursor.fetchone()
        if row:
            return row_to_dict(cursor=cursor, row=row)
        else:
            raise DatabaseException(detail=f"Agent {name} not found: {str(e)}")
    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Error in retrieving agent:{name}: {str(e)}")
    finally:
        if conn:
            conn.close()

# delete agent
def delete_agent(name: str) -> None:
    try:
        conn, cursor = _get_db_connection()
        # Check if the agent exists before attempting to delete
        cursor.execute("SELECT * FROM agents WHERE name = ?", (name,))
        if not cursor.fetchone():
            raise DatabaseException(detail=f"Agent:{name} not found: {str(e)}")

        # Delete the agent record from the database
        cursor.execute("DELETE FROM agents WHERE name = ?", (name,))
        conn.commit()
    except sqlite3.Error as e:
        raise DatabaseException(detail=f"Error in deleting agent:{name}: {str(e)}")
    finally:
        if conn:
            conn.close()