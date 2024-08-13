db = db.getSiblingDB('clubDB');

db.createUser({
  user: "admin",
  pwd: "admin",
  roles: [{ role: "readWrite", db: "clubDB" }]
});