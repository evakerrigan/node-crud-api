Application CRUD API on noodejs

## Preparing for cross-check

#### Clone repo

```
git clone https://github.com/evakerrigan/node-crud-api.git
```

#### Change folder

```
cd node-crud-api
```

#### Install dependencies

```
npm install
```

#### Create .env file in root folder (you can choose any number)

```
PORT=5555
```

#### Run in development mode

```
npm run start:dev
```

#### Run in production mode

```
npm run start:prod
```

---

## Opportunities

#### Get all users

```
method: get
address: 127.0.0.1:5555/api/users
```

#### Add one user

```
method: post
address: 127.0.0.1:5555/api/users
body: {
    "username": "test name",
    "age": 99,
    "hobbies": ["travels"]
}
```

#### Get user

```
method: get
address: 127.0.0.1:5555/api/users/${userID}
```

#### Update user

```
method: put
address: 127.0.0.1:5555/api/users/${userID}
body: {
    "username": "test name2",
    "age": 100,
    "hobbies": ["travels"]
}
```

#### Delete user

```
method: delete
address: 127.0.0.1:5555/api/users/${userID}
```

---
