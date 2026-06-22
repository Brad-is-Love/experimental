import sqlite3
import zipfile
import json
import os

db_path = "collection.anki2"
conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute('''CREATE TABLE notes (
    id INTEGER PRIMARY KEY,
    guid TEXT,
    mid INTEGER,
    mod INTEGER,
    usn INTEGER,
    tags TEXT,
    flds TEXT,
    sfld INTEGER,
    csum INTEGER,
    flags INTEGER,
    data TEXT
)''')

c.execute('''CREATE TABLE cards (
    id INTEGER PRIMARY KEY,
    nid INTEGER,
    did INTEGER,
    ord INTEGER,
    mod INTEGER,
    usn INTEGER,
    type INTEGER,
    queue INTEGER,
    due INTEGER,
    ivl INTEGER,
    factor INTEGER,
    reps INTEGER,
    lapses INTEGER,
    left INTEGER,
    odue INTEGER,
    odid INTEGER,
    flags INTEGER,
    data TEXT
)''')

flds = "El perro\x1fThe dog"
c.execute(f"INSERT INTO notes (id, flds) VALUES (1, '{flds}')")
c.execute("INSERT INTO cards (id, nid, type, ivl) VALUES (1, 1, 1, 10)")

conn.commit()
conn.close()

with zipfile.ZipFile("test_deck.apkg", "w") as z:
    z.write("collection.anki2")

print("Created test_deck.apkg")
