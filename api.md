
# NiceDoors 后端接口文档

## 1. 认证接口 (/auth)

### 1.1 登录接口

- **请求方法**: POST
- **请求路径**: `/auth/login`
- **请求体**:

  ```json
  {
    "email": "alex@proframe.design",
    "password": "ChangeMe123!"
  }
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
      "tokenType": "bearer",
      "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    },
    "message": "Success"
  }
  ```

- **注意事项**:
  - 密码必须至少8位，包含大小写字母、数字和特殊字符
  - 登录成功后，前端需要存储返回的 `accessToken` 和 `refreshToken`

### 1.2 刷新令牌接口

- **请求方法**: POST
- **请求路径**: `/auth/refresh`
- **请求体**:

  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
  }
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
      "tokenType": "bearer",
      "refreshToken": null,
    },
    "message": "Success"
  }
  ```

- **注意事项**:
  - 当 `accessToken` 过期时，使用 `refreshToken` 来获取新的 `accessToken`
  - `refreshToken` 的有效期为7天

## 2. 用户接口 (/user)

### 2.1 获取用户资料接口

- **请求方法**: GET
- **请求路径**: `/user/profile`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "id": "405ec33a-2c35-4297-84dd-db84b342fe31",
      "name": "Alex",
      "email": "alex@proframe.design",
      "phone": "13800138000",
      "avatar": null,
      "role": "admin",
      "company": "ProFrame Design",
      "plan": "premium"
    },
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`

### 2.2 更新用户资料接口

- **请求方法**: PUT
- **请求路径**: `/user/profile`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **请求体**:

  ```json
  {
    "name": "Alex Updated",
    "phone": "13900139000",
    "avatar": "https://example.com/avatar.jpg",
    "company": "ProFrame Design Updated",
    "plan": "enterprise"
  }
  ```

- **响应体**:

  ```json
  {
    "code": 200,
  "data": "{\"success\": true}",
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 请求体中的字段都是可选的，只需要提供需要更新的字段

## 3. 客户接口 (/customers)

### 3.1 获取客户列表接口

- **请求方法**: GET
- **请求路径**: `/customers`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": [
      {
        "id": "1",
        "name": "张三",
        "phone": "13800138001",
        "address": "北京市朝阳区",
        "remark": "重要客户",
        "createdAt": "2026-02-26 12:00:00"
      },
      {
        "id": "2",
        "name": "李四",
        "phone": "13800138002",
        "address": "上海市浦东新区",
        "remark": "普通客户",
        "createdAt": "2026-02-26 13:00:00"
      }
    ],
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`

### 3.2 获取单个客户接口

- **请求方法**: GET
- **请求路径**: `/customers/{id}`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "id": "1",
      "name": "张三",
      "phone": "13800138001",
      "address": "北京市朝阳区",
      "remark": "重要客户",
      "createdAt": "2026-02-26 12:00:00"
    },
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 如果客户不存在，会返回 404 错误

### 3.3 创建客户接口

- **请求方法**: POST
- **请求路径**: `/customers`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **请求体**:

  ```json
  {
    "name": "王五",
    "phone": "13800138003",
    "address": "广州市天河区",
    "remark": "新客户"
  }
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "id": "3",
      "name": "王五",
      "phone": "13800138003",
      "address": "广州市天河区",
      "remark": "新客户",
      "createdAt": "2026-02-26 14:00:00"
    },
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - `name` 和 `phone` 字段是必填的

### 3.4 更新客户接口

- **请求方法**: PUT
- **请求路径**: `/customers/{id}`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **请求体**:

  ```json
  {
    "name": "王五 Updated",
    "phone": "13900139003",
    "address": "广州市越秀区",
    "remark": "重要客户"
  }
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": "{\"success\": true}",
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 请求体中的字段都是可选的，只需要提供需要更新的字段
  - 如果客户不存在，会返回 404 错误

### 3.5 删除客户接口

- **请求方法**: DELETE
- **请求路径**: `/customers/{id}`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": "{\"success\": true}",
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 如果客户不存在，会返回 404 错误

## 4. 订单接口 (/orders)

### 4.1 获取订单列表接口

- **请求方法**: GET
- **请求路径**: `/orders`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": [
      {
        "id": "1",
        "customerName": "张三",
        "customerPhone": "13800138001",
        "address": "北京市朝阳区",
        "date": "2026-02-26",
        "items": "[{\"name\": \"门\", \"quantity\": 1, \"price\": 1000}]",
        "totalAmount": 1000,
        "paidAmount": 500,
        "status": "pending"
      },
      {
        "id": "2",
        "customerName": "李四",
        "customerPhone": "13800138002",
        "address": "上海市浦东新区",
        "date": "2026-02-25",
        "items": "[{\"name\": \"窗\", \"quantity\": 2, \"price\": 500}]",
        "totalAmount": 1000,
        "paidAmount": 1000,
        "status": "completed"
      }
    ],
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`

### 4.2 获取单个订单接口

- **请求方法**: GET
- **请求路径**: `/orders/{id}`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "id": "1",
      "customerName": "张三",
      "customerPhone": "13800138001",
      "address": "北京市朝阳区",
      "date": "2026-02-26",
      "items": "[{\"name\": \"门\", \"quantity\": 1, \"price\": 1000}]",
      "totalAmount": 1000,
      "paidAmount": 500,
      "status": "pending"
    },
    "message": "Success"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 如果订单不存在，会返回 404 错误

### 4.3 创建订单接口

- **请求方法**: POST
- **请求路径**: `/orders`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **请求体**:

  ```json
  {
    "customerName": "王五",
    "customerPhone": "13800138003",
    "address": "广州市天河区",
    "date": "2026-02-27",
    "items": "[{\"name\": \"门\", \"quantity\": 1, \"price\": 1000}, {\"name\": \"窗\", \"quantity\": 1, \"price\": 500}]",
    "totalAmount": 1500,
    "paidAmount": 0,
    "status": "pending"
  }
  ```

- **响应体**:

  ```json
  {
    "code": 201,
    "data": {
      "id": "3",
      "customerName": "王五",
      "customerPhone": "13800138003",
      "address": "广州市天河区",
      "date": "2026-02-27",
      "items": "[{\"name\": \"门\", \"quantity\": 1, \"price\": 1000}, {\"name\": \"窗\", \"quantity\": 1, \"price\": 500}]",
      "totalAmount": 1500,
      "paidAmount": 0,
      "status": "pending"
    },
    "message": "订单创建成功"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - `customerName`、`customerPhone`、`date`、`items`、`totalAmount`、`paidAmount` 和 `status` 字段是必填的
  - `items` 字段需要是 JSON 字符串格式

### 4.4 更新订单接口

- **请求方法**: PUT
- **请求路径**: `/orders/{id}`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **请求体**:

  ```json
  {
    "customerName": "王五 Updated",
    "customerPhone": "13900139003",
    "address": "广州市越秀区",
    "date": "2026-02-28",
    "items": "[{\"name\": \"门\", \"quantity\": 1, \"price\": 1200}, {\"name\": \"窗\", \"quantity\": 1, \"price\": 600}]",
    "totalAmount": 1800,
    "paidAmount": 900,
    "status": "in_progress"
  }
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": {
      "id": "3",
      "customerName": "王五 Updated",
      "customerPhone": "13900139003",
      "address": "广州市越秀区",
      "date": "2026-02-28",
      "items": "[{\"name\": \"门\", \"quantity\": 1, \"price\": 1200}, {\"name\": \"窗\", \"quantity\": 1, \"price\": 600}]",
      "totalAmount": 1800,
      "paidAmount": 900,
      "status": "in_progress"
    },
    "message": "订单更新成功"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 请求体中的字段都是可选的，只需要提供需要更新的字段
  - 如果订单不存在，会返回 404 错误

### 4.5 删除订单接口

- **请求方法**: DELETE
- **请求路径**: `/orders/{id}`
- **请求头**:

  ```
  Authorization: Bearer <accessToken>
  ```

- **响应体**:

  ```json
  {
    "code": 200,
    "data": null,
    "message": "订单删除成功"
  }
  ```

- **注意事项**:
  - 需要在请求头中携带有效的 `accessToken`
  - 如果订单不存在，会返回 404 错误

## 5. 通用响应格式

所有接口的响应都遵循以下格式：

```json
{
  "code": 200, // 状态码
  "data": {}, // 响应数据
  "message": "Success" // 响应消息
}
```

- **状态码说明**:
  - 200: 成功
  - 201: 创建成功
  - 401: 未授权（令牌无效或过期）
  - 404: 资源不存在
  - 500: 服务器内部错误

## 6. 注意事项

1. **令牌管理**:
   - `accessToken` 有效期为1天，用于日常请求
   - `refreshToken` 有效期为7天，用于获取新的 `accessToken`
   - 令牌需要在请求头中以 `Bearer <token>` 的形式携带

2. **数据验证**:
   - 所有请求体都会进行验证，缺少必填字段会返回错误
   - 密码强度会进行验证，至少8位，包含大小写字母、数字和特殊字符

3. **错误处理**:
   - 接口会返回详细的错误信息，前端需要根据错误信息进行处理
   - 401 错误表示令牌无效或过期，需要重新登录或刷新令牌

4. **数据格式**:
   - `items` 字段需要是 JSON 字符串格式
   - 日期格式为 `YYYY-MM-DD`

5. **测试用户**:
   - 系统启动时会自动创建测试用户
   - 邮箱: <alex@proframe.design>
   - 密码: ChangeMe123!

6. **CORS 配置**:
   - 系统已配置 CORS，支持跨域请求
   - 前端可以直接调用接口，不需要额外的配置

7. **Swagger UI**:
   - 可以通过 <http://localhost:8000/swagger-ui.html> 访问 Swagger UI
   - 在 Swagger UI 中可以测试所有接口

希望这个文档对您有所帮助！如果您有任何问题，请随时告诉我。
