# Autentikigo

An authentication package.

- [Instalation](#instalation)
- [Use](#use)
- [Register method](#register-method)
- [Login method](#login-method)
- [Authorize method](#authorize-method)
- [Middleware method](#middleware-method)
- [Get user info method](#get-user-info-method)

## Instalation

To install the autentikigo, use one of the following command:

- **npm**: `npm install autentikigo`

## Use

```js
var autentikigo = require('autentikigo')
```

## Register method

```js
var register = await autentikigo.register(queryParams, connectionParams);
```

### `queryParams`

Required parameters.

Tipo: `object`

- `uniqueId` (*string*)
- `birthday` (*date*)
- `email` (*string*)
- `password` (*string*)
- `cpfApiEndpoint` (*string*)

#### `uniqueId`

> CPF of the user that will be registered.

#### `birthday`

> User birthday.

#### `email`

> User e-mail.

#### `password`

> User password.

#### `cpfApiEndpoint`

> Endpoint of CPF API (https://www.cpfcnpj.com.br/).

##### Exemplo

```
https://api.cpfcnpj.com.br/5ae973d7a997af13f0aaf2bf60e65803/2/
```

### `connectionParams`

Connection parameters (Required).

Tipo: `object`

- `connectionString` (*string*)

#### `connectionString`

> MongoDB connection string.

##### Exemplo

```
mongodb://127.0.0.1:27017/autentikigo
```

## Login method

```js
var login = await autentikigo.login(queryParams, connectionParams);
```

### `queryParams`

Required parameters.

Tipo: `object`

- `user` (*string*)
- `password` (*string*)
- `projectId` (*string*)
- `jwtSecret` (*string*)
- `jwtRefreshSecret` (*string*)

#### `user`

> CPF, usernama or email of the user that will be authenticated.

#### `password`

> User password.

#### `projectId`

> Id of the application/project that wants to authenticate user.

#### `jwtSecret`

> Secret to create the authentication token (JWT).

#### `jwtRefreshSecret`

> Secret to create the authentication refresh token (JWT).

### `connectionParams`

Connection parameters (Required).

Tipo: `object`

- `connectionString` (*string*)

#### `connectionString`

> MongoDB connection string.

##### Exemplo

```
mongodb://127.0.0.1:27017/autentikigo
```

## Authorize method

```js
var authorize = await autentikigo.authorizeProject(queryParams, connectionParams);
```

### `queryParams`

Required parameters.

Tipo: `object`

- `userId` (*string*)
- `role` (*string*)
- `verified` (*boolean*)
- `projectId` (*string*)

#### `userId`

> Id of user that will be authorize application/project to use his data.

#### `role`

> User role in the specifique application/project.

#### `verified`

> Parameter that defines if user was verified.

#### `projectId`

> Id of the application/project that wants to authenticate user.

### `connectionParams`

Connection parameters (Required).

Tipo: `object`

- `connectionString` (*string*)

#### `connectionString`

> MongoDB connection string.

##### Exemplo

```
mongodb://127.0.0.1:27017/autentikigo
```

## Middleware method

```js
var middleware = await autentikigo.middleware(queryParams, connectionParams);
```

### `queryParams`

Required parameters.

Tipo: `object`

- `token` (*string*)
- `jwtSecret` (*string*)
- `userId` (*string*)
- `projectId` (*string*)
- `roles` (*array*)
- `endpoint` (*string*)
- `method` (*string*)

#### `token`

> Authentication token (JWT) obtained in the login method.

#### `jwtSecret`

> Secret to verify the authentication token (JWT).

#### `userId`

> Id of user that will be authorize application/project to use his data.

#### `projectId`

> Id of the application/project that wants to authenticate user.

#### `roles`

> Array of roles (ACL).

##### Exemplo

```json
[
    {
      "group": "user",
      "permissions": [
        {
          "resource": "users/*",
          "methods": [
            "POST",
            "GET",
            "PUT"
          ]
        }
      ]
    },
]
```

#### `endpoint`

> Endpoint that user want to access.

#### `method`

> Method to use in endpoint.

##### Exemplo

```
'POST'
```

### `connectionParams`

Connection parameters (Required).

Tipo: `object`

- `connectionString` (*string*)

#### `connectionString`

> MongoDB connection string.

##### Exemplo

```
mongodb://127.0.0.1:27017/autentikigo
```

## Get user info method

```js
var userInfo = await autentikigo.getUserInfo(queryParams, connectionParams);
```

### `queryParams`

Required parameters.

Tipo: `object`

- `token` (*string*)
- `jwtSecret` (*string*)
- `projectId` (*string*)

#### `token`

> Authentication token (JWT) obtained in the login method.

#### `jwtSecret`

> Secret to verify the authentication token (JWT).

#### `projectId`

> Id of the application/project that wants to authenticate user.

### `connectionParams`

Connection parameters (Required).

Tipo: `object`

- `connectionString` (*string*)

#### `connectionString`

> MongoDB connection string.

##### Exemplo

```
mongodb://127.0.0.1:27017/autentikigo
```