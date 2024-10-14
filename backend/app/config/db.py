import os
from pymongo import MongoClient
from dotenv import load_dotenv


load_dotenv()

mongo_url = os.getenv("MONGO_URL")
print(mongo_url)

conn = MongoClient(mongo_url)
