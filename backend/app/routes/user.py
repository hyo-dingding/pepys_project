from fastapi import APIRouter
 
from models.user import User
from config.db import conn
from schemas.user import userEntity, usersEntity
from bson import ObjectId
 
user = APIRouter()
 
@user.get("/user")
async def find_all_users():
    print(conn.rag_db.user.find())
    print(usersEntity(conn.rag_db.user.find()))
    return usersEntity(conn.rag_db.user.find())
 
@user.get("/user/{id}")
async def find_one_user(id):
    return userEntity(conn.rag_db.user.find_one({"_id":ObjectId(id)}))
 
@user.post("/user")
async def create_users(user: User):
    conn.rag_db.user.insert_one(dict(user))
    return usersEntity(conn.rag_db.user.find())
 
@user.put("/user/{id}")
async def update_users(id, user: User):
    conn.rag_db.user.find_one_and_update({"_id":ObjectId(id)}, {"$set":dict(user)})
    return userEntity(conn.rag_db.user.find_one({"_id":ObjectId(id)}))
   
   
@user.delete("/user/{id}")
async def delete_users(id, user: User):
    return userEntity(conn.rag_db.user.find_one_and_delete({"_id":ObjectId(id)}))

