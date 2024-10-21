def userEntity(item) -> dict:
    return {
        "id":str(item["_id"]),
        "name":item["name"],
        "email":item["email"],
        "nationality": item["nationality"],
        "work_title": item["work_title"]
    }
   
   
def usersEntity(entity) -> list:
    return [userEntity(item) for item in entity]