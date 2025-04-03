import sqlite3
import os
import pandas as pd
import numpy as np
DB_NAME = "guidance_system.db"

def get_db_connection():
    """Creates and returns a database connection."""
    connection = sqlite3.connect(DB_NAME)
    connection.execute("PRAGMA foreign_keys = ON")  # Enable foreign keys
    connection.row_factory = sqlite3.Row  # Enable dictionary-like row access
    print("Connected to database")
    return connection

def close_db_connection(connection):
    """Closes the database connection."""
    connection.close()

def create_db(password):
    """Creates the database and necessary tables if they do not exist."""
    # Check if a directory with the same name exists and remove it
    if os.path.isdir(DB_NAME):
        os.rmdir(DB_NAME)
        print(f"Removed directory with same name as database: {DB_NAME}")
    
    # Create the database file if it doesn't exist
    if not os.path.exists(DB_NAME):
        with open(DB_NAME, 'w') as f:
            pass
        print(f"Created new database file: {DB_NAME}")
    connection = get_db_connection()
    cursor = connection.cursor()
    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        user_type TEXT CHECK(user_type IN ('admin', 'viewer')) NOT NULL DEFAULT 'viewer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create records table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        username TEXT NOT NULL,
        type TEXT CHECK(type IN ('ASSI-A', 'ASSI-C')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
    )
    """)

    # Insert default admin user if not exists
    cursor.execute("SELECT * FROM users WHERE username = 'superadmin'")
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (username, password_hash, first_name, last_name, user_type)
        VALUES ('superadmin', ?, 'Admin', 'User', 'admin')
        """, (password,))
    connection.commit()
    print("Database tables created successfully")
    close_db_connection(connection)

def test_db_connection():
    """Tests the database connection by executing a simple query."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM sqlite_master")
        rows = cursor.fetchall()
        cursor.close()
        close_db_connection(connection)
        return rows
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        cursor.close()
        close_db_connection(connection)
        return False

def authenticate(username, password):
    """Authenticates a user by verifying credentials against the database."""
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ? AND password_hash = ?", (username, password))
    user = cursor.fetchone()
    cursor.close()
    close_db_connection(connection)

    if user:
        return {
            "id": str(user["id"]),
            "username": user["username"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "user_type": user["user_type"]
        }
    return None

def insert_user(username, password, first_name, last_name, user_type="viewer"):
    """Inserts a new user into the database."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Create users table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            user_type TEXT CHECK(user_type IN ('admin', 'viewer')) NOT NULL DEFAULT 'viewer',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """)

        query = """INSERT INTO users (username, password_hash, first_name, last_name, user_type) 
                   VALUES (?, ?, ?, ?, ?)"""
        cursor.execute(query, (username, password, first_name, last_name, user_type))
        connection.commit()
        cursor.close()  
        close_db_connection(connection)
        return True
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        connection.rollback()
        cursor.close()
        close_db_connection(connection)
        return False

def get_all_users():
    """Retrieves all users from the database."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM users")
        users = cursor.fetchall()
        cursor.close()
        close_db_connection(connection)
        return [{"id": str(user["id"]), "username": user["username"], "first_name": user["first_name"], "last_name": user["last_name"], "user_type": user["user_type"]} for user in users]
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        cursor.close()
        close_db_connection(connection)
        return False

def delete_user(id):
    """Deletes a user from the database."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (id,))
        connection.commit()
        cursor.close()
        close_db_connection(connection)
        return True
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        cursor.close()
        close_db_connection(connection)
        return False
    
def insert_result_record(uuid, name, username, type):
    """Inserts a record for a user."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        # Create records table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            username TEXT NOT NULL,
            type TEXT CHECK(type IN ('ASSI-A', 'ASSI-C')) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
        """)

        query = "INSERT INTO records (uuid, name, username, type) VALUES (?, ?, ?, ?)"
        cursor.execute(query, (uuid, name, username, type))
        connection.commit()
        cursor.close()
        close_db_connection(connection)
        return True
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        connection.rollback()
        cursor.close()
        close_db_connection(connection)
        return False

def get_user_records(username):
    """Retrieves all records associated with a specific username."""
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT * FROM records WHERE username = ?", (username,))
        records = cursor.fetchall()
        print(records)
        cursor.close()
        close_db_connection(connection)
        return [dict(record) for record in records]  # Convert rows to dict
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        cursor.close()
        close_db_connection(connection)
        return False
    
def delete_record(uuid):
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        # Create archived records table if it doesn't exist
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS archived_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uuid TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            username TEXT NOT NULL,
            type TEXT CHECK(type IN ('ASSI-A', 'ASSI-C')) NOT NULL,
            archived_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
        )
        """)
        cursor.execute("DELETE FROM records WHERE uuid = ?", (uuid,))
        connection.commit()
        cursor.close()
        close_db_connection(connection)
        
        return True
    except sqlite3.Error as err:
        print("SQLite Error:", err)
        cursor.close()
        close_db_connection(connection)
        return False

def get_student_data_by_uuid_and_name(uuid, name, form_type):
    try:
        df = pd.read_csv(f'student_data/{form_type}/{uuid}.csv')
        df['Name'] = df['Name'].astype(str)
        print(df['Name'].head())
        df = df[df['Name'] == name]
        print(len(df))
        print(df.head())
        student_data = {
            'Name': name,
            'Grade': int(df['Grade'].iloc[0]) if not df['Grade'].empty else None,
            'Gender': df['Gender'].iloc[0] if not df['Gender'].empty else None,
            'Cluster': int(df['Cluster'].iloc[0]) if not df['Cluster'].empty else None,
            'Questions': {col: int(df[col].iloc[0]) if isinstance(df[col].iloc[0], np.int64) else df[col].iloc[0] 
                         for col in df.columns if col not in ['Name', 'Grade', 'Gender', 'Cluster']}
        }
        return student_data
    except Exception as e:
        print("Error:", e)
        return False

def update_student_cluster(uuid,name,cluster,form_type):
    try:
        df = pd.read_csv(f'student_data/{form_type}/{uuid}.csv')
        df['Name'] = df['Name'].astype(str)
        df.loc[df['Name'] == name, 'Cluster'] = int(cluster)
        df.to_csv(f'student_data/{form_type}/{uuid}.csv', index=False)
        return True
    except Exception as e:
        print("Error:", e)
        return False
