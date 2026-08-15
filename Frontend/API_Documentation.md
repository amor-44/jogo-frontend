# Jogo API v1 Documentation

**Version:** v1

**Servers:**
- `https://jogofootball.runasp.net/`

## Authentication

- **Bearer**: http, scheme: bearer, format: JWT
  - JWT Authorization header using Bearer scheme.

Endpoints marked with 🔒 require this authentication.

## Table of Contents

- [Auth](#auth)
- [ContactRequests](#contactrequests)
- [Player Dashboard (Private)](#player-dashboard-private)
- [Scout Discovery (Public)](#scout-discovery-public)
- [Reports](#reports)
- [Scout](#scout)
- [Videos](#videos)

---

## Auth

### `POST /api/v1/auth/login`

**Request Body** (required, `application/json`):

Schema: `LoginCommand`

- `email`: string (**required**)
- `password`: string (**required**)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `401` — Unauthorized → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `POST /api/v1/auth/register/player`

**Request Body** (required, `application/json`):

Schema: `RegisterPlayerCommand`

- `email`: string (**required**)
- `password`: string (**required**)
- `fullName`: string (**required**)
- `dateOfBirth`: string (date-time) (**required**)
- `primaryPosition`: Position (**required**)
- `preferredFoot`: PreferredFoot (**required**)
- `country`: string (**required**)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `409` — Conflict → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `POST /api/v1/auth/register/scout`

**Request Body** (required, `application/json`):

Schema: `RegisterScoutCommand`

- `email`: string (**required**)
- `password`: string (**required**)
- `organization`: string (**required**)
- `country`: string (**required**)
- `experienceYears`: integer (int32) (**required**)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `409` — Conflict → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `POST /api/v1/auth/refresh`

**Request Body** (required, `application/json`):

Schema: `RefreshCommand`

- `accessToken`: string (**required**)
- `refreshToken`: string (**required**)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `401` — Unauthorized → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `403` — Forbidden → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `POST /api/v1/auth/logout`

**Auth:** Required 🔒

**Request Body** (required, `application/json`):

Schema: `LogoutCommand`

- `refreshToken`: string (**required**)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

## ContactRequests

### `POST /api/v1/contact-requests`

**Auth:** Required 🔒

**Request Body** (required, `application/json`):

Schema: `CreateContactRequestCommand`

- `playerProfileId`: string (uuid) (**required**)
- `message`: string|null (**required**)

**Responses:**

- `200` — OK → `string (uuid)` (`text/plain`)
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `401` — Unauthorized → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `409` — Conflict → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `POST /api/v1/contact-requests/{id}/respond`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes |  |

**Request Body** (required, `application/json`):

Schema: `RespondToContactRequestDto`

- `accept`: boolean (optional)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `401` — Unauthorized → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `403` — Forbidden → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `GET /api/v1/contact-requests/player`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `pageNumber` | query | integer (int32) | No |  |
| `pageSize` | query | integer (int32) | No |  |

**Responses:**

- `200` — OK → `PaginatedListOfPlayerContactRequestDto` (`text/plain`)
  - `pageNumber`: integer (int32) (optional)
  - `pageSize`: integer (int32) (optional)
  - `totalPages`: integer (int32) (optional)
  - `totalCount`: integer (int32) (optional)
  - `items`: array<PlayerContactRequestDto> (optional)

---

### `GET /api/v1/contact-requests/scout`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `pageNumber` | query | integer (int32) | No |  |
| `pageSize` | query | integer (int32) | No |  |

**Responses:**

- `200` — OK → `PaginatedListOfScoutContactRequestDto` (`text/plain`)
  - `pageNumber`: integer (int32) (optional)
  - `pageSize`: integer (int32) (optional)
  - `totalPages`: integer (int32) (optional)
  - `totalCount`: integer (int32) (optional)
  - `items`: array<ScoutContactRequestDto> (optional)

---

## Player Dashboard (Private)

### `GET /api/v1/player/me`

**Auth:** Required 🔒

**Responses:**

- `200` — OK → `PlayerProfileDto` (`text/plain`)
  - `id`: string (uuid) (**required**)
  - `fullName`: string (**required**)
  - `dateOfBirth`: string (date-time) (**required**)
  - `age`: integer (int32) (**required**)
  - `country`: string (**required**)
  - `city`: string|null (**required**)
  - `height`: number (double) (**required**)
  - `weight`: number (double) (**required**)
  - `preferredFoot`: PreferredFoot (**required**)
  - `primaryPosition`: Position (**required**)
  - `secondaryPosition`: object (**required**)
  - `currentClub`: string|null (**required**)
  - `biography`: string|null (**required**)
  - `profilePictureUrl`: string|null (**required**)
  - `visibility`: ProfileVisibility (**required**)
  - `isComplete`: boolean (**required**)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `PUT /api/v1/player/me`

**Auth:** Required 🔒

**Request Body** (required, `application/json`):

Schema: `UpdateProfileCommand`

- `city`: string|null (**required**)
- `height`: number (double) (**required**)
- `weight`: number (double) (**required**)
- `secondaryPosition`: object (**required**)
- `currentClub`: string|null (**required**)
- `biography`: string|null (**required**)
- `footballExperience`: string|null (**required**)
- `marketValue`: number (double) (**required**)
- `visibility`: ProfileVisibility (**required**)

**Responses:**

- `200` — OK
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `POST /api/v1/player/profile/image`

**Auth:** Required 🔒

**Request Body** (required, `multipart/form-data`):

Type: `object`

**Responses:**

- `200` — OK → `string` (`text/plain`)
- `400` — Bad Request → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

## Scout Discovery (Public)

### `GET /api/v1/players`

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `PageNumber` | query | integer (int32) | No |  |
| `PageSize` | query | integer (int32) | No |  |
| `MinAge` | query | integer (int32) | No |  |
| `MaxAge` | query | integer (int32) | No |  |
| `Position` | query | Position | No |  |
| `Country` | query | string | No |  |
| `MinOverallScore` | query | integer (int32) | No |  |
| `MaxOverallScore` | query | integer (int32) | No |  |

**Responses:**

- `200` — OK → `PaginatedListOfPlayerCardDto` (`text/plain`)
  - `pageNumber`: integer (int32) (optional)
  - `pageSize`: integer (int32) (optional)
  - `totalPages`: integer (int32) (optional)
  - `totalCount`: integer (int32) (optional)
  - `items`: array<PlayerCardDto> (optional)

---

### `GET /api/v1/players/{id}`

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes |  |

**Responses:**

- `200` — OK → `PlayerCardDto` (`text/plain`)
  - `id`: string (uuid) (**required**)
  - `fullName`: string (**required**)
  - `age`: integer (int32) (**required**)
  - `country`: string (**required**)
  - `city`: string|null (**required**)
  - `primaryPosition`: Position (**required**)
  - `secondaryPosition`: object (**required**)
  - `currentClub`: string|null (**required**)
  - `footballExperience`: string|null (**required**)
  - `marketValue`: number (double) (**required**)
  - `profilePictureUrl`: string|null (**required**)
  - `latestOverallScore`: integer (int32) (**required**)
  - `videoCount`: integer (int32) (optional)
  - `reports`: array<AnalysisReportDto> (optional)
- `403` — Forbidden → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

## Reports

### `GET /api/v1/Reports/{id}`

**Summary:** Gets a specific analysis report by its ID.

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes | The ID of the report to retrieve. |

**Responses:**

- `200` — OK → `AnalysisReportDto` (`text/plain`)
  - `id`: string (uuid) (**required**)
  - `videoId`: string (uuid) (**required**)
  - `overallScore`: integer (int32) (**required**)
  - `summary`: string (**required**)
  - `strengths`: array<string> (**required**)
  - `weaknesses`: array<string> (**required**)
  - `recommendations`: array<string> (**required**)
  - `aiModelVersion`: string (**required**)
  - `completedAt`: string (date-time) (**required**)
  - `metrics`: PerformanceMetricsDto (**required**)
- `401` — Unauthorized → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `403` — Forbidden → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)
- `404` — Not Found → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

### `GET /api/v1/Reports`

**Summary:** Lists all analysis reports for the current player.

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `pageNumber` | query | integer (int32) | No | The page number to retrieve. |
| `pageSize` | query | integer (int32) | No | The number of items per page. |

**Responses:**

- `200` — OK → `PaginatedListOfAnalysisReportDto` (`text/plain`)
  - `pageNumber`: integer (int32) (optional)
  - `pageSize`: integer (int32) (optional)
  - `totalPages`: integer (int32) (optional)
  - `totalCount`: integer (int32) (optional)
  - `items`: array<AnalysisReportDto> (optional)
- `401` — Unauthorized → `ProblemDetails` (`text/plain`)
  - `type`: string|null (optional)
  - `title`: string|null (optional)
  - `status`: integer (int32) (optional)
  - `detail`: string|null (optional)
  - `instance`: string|null (optional)

---

## Scout

### `GET /api/v1/scout/me`

**Summary:** Get current scout profile.

**Auth:** Required 🔒

**Responses:**

- `200` — OK

---

### `PUT /api/v1/scout/me`

**Summary:** Update current scout profile.

**Auth:** Required 🔒

**Request Body** (required, `application/json`):

Schema: `UpdateProfileCommand`

- `city`: string|null (**required**)
- `height`: number (double) (**required**)
- `weight`: number (double) (**required**)
- `secondaryPosition`: object (**required**)
- `currentClub`: string|null (**required**)
- `biography`: string|null (**required**)
- `footballExperience`: string|null (**required**)
- `marketValue`: number (double) (**required**)
- `visibility`: ProfileVisibility (**required**)

**Responses:**

- `200` — OK

---

## Videos

### `GET /api/v1/Videos`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `pageNumber` | query | integer (int32) | No |  |
| `pageSize` | query | integer (int32) | No |  |

**Responses:**

- `200` — OK

---

### `POST /api/v1/Videos`

**Auth:** Required 🔒

**Request Body** (required, `multipart/form-data`):

Type: `object`

**Responses:**

- `200` — OK

---

### `GET /api/v1/Videos/{id}`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes |  |

**Responses:**

- `200` — OK

---

### `DELETE /api/v1/Videos/{id}`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes |  |

**Responses:**

- `200` — OK

---

### `POST /api/v1/Videos/{id}/analysis`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes |  |

**Responses:**

- `200` — OK

---

### `POST /api/v1/Videos/{id}/analysis/retry`

**Auth:** Required 🔒

**Parameters:**

| Name | In | Type | Required | Description |
|------|----|----|----|----|
| `id` | path | string (uuid) | Yes |  |

**Responses:**

- `200` — OK

---

## Data Models (Schemas)

### `AnalysisReportDto`

| Field | Type | Required |
|-------|------|----------|
| `id` | string (uuid) | Yes |
| `videoId` | string (uuid) | Yes |
| `overallScore` | integer (int32) | Yes |
| `summary` | string | Yes |
| `strengths` | array<string> | Yes |
| `weaknesses` | array<string> | Yes |
| `recommendations` | array<string> | Yes |
| `aiModelVersion` | string | Yes |
| `completedAt` | string (date-time) | Yes |
| `metrics` | PerformanceMetricsDto | Yes |

### `CreateContactRequestCommand`

| Field | Type | Required |
|-------|------|----------|
| `playerProfileId` | string (uuid) | Yes |
| `message` | string|null | Yes |

### `IFormFile`

_No properties defined._

### `LoginCommand`

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |

### `LogoutCommand`

| Field | Type | Required |
|-------|------|----------|
| `refreshToken` | string | Yes |

### `PaginatedListOfAnalysisReportDto`

| Field | Type | Required |
|-------|------|----------|
| `pageNumber` | integer (int32) | No |
| `pageSize` | integer (int32) | No |
| `totalPages` | integer (int32) | No |
| `totalCount` | integer (int32) | No |
| `items` | array<AnalysisReportDto> | No |

### `PaginatedListOfPlayerCardDto`

| Field | Type | Required |
|-------|------|----------|
| `pageNumber` | integer (int32) | No |
| `pageSize` | integer (int32) | No |
| `totalPages` | integer (int32) | No |
| `totalCount` | integer (int32) | No |
| `items` | array<PlayerCardDto> | No |

### `PaginatedListOfPlayerContactRequestDto`

| Field | Type | Required |
|-------|------|----------|
| `pageNumber` | integer (int32) | No |
| `pageSize` | integer (int32) | No |
| `totalPages` | integer (int32) | No |
| `totalCount` | integer (int32) | No |
| `items` | array<PlayerContactRequestDto> | No |

### `PaginatedListOfScoutContactRequestDto`

| Field | Type | Required |
|-------|------|----------|
| `pageNumber` | integer (int32) | No |
| `pageSize` | integer (int32) | No |
| `totalPages` | integer (int32) | No |
| `totalCount` | integer (int32) | No |
| `items` | array<ScoutContactRequestDto> | No |

### `PerformanceMetricsDto`

| Field | Type | Required |
|-------|------|----------|
| `positionScore` | integer (int32) | Yes |
| `passingAccuracy` | integer (int32) | Yes |
| `ballControl` | integer (int32) | Yes |
| `positioningScore` | integer (int32) | Yes |
| `movementEfficiency` | integer (int32) | Yes |
| `defensiveActions` | integer (int32) | Yes |
| `attackingImpact` | integer (int32) | Yes |
| `decisionMaking` | integer (int32) | Yes |

### `PlayerCardDto`

| Field | Type | Required |
|-------|------|----------|
| `id` | string (uuid) | Yes |
| `fullName` | string | Yes |
| `age` | integer (int32) | Yes |
| `country` | string | Yes |
| `city` | string|null | Yes |
| `primaryPosition` | Position | Yes |
| `secondaryPosition` | object | Yes |
| `currentClub` | string|null | Yes |
| `footballExperience` | string|null | Yes |
| `marketValue` | number (double) | Yes |
| `profilePictureUrl` | string|null | Yes |
| `latestOverallScore` | integer (int32) | Yes |
| `videoCount` | integer (int32) | No |
| `reports` | array<AnalysisReportDto> | No |

### `PlayerContactRequestDto`

| Field | Type | Required |
|-------|------|----------|
| `contactRequestId` | string (uuid) | Yes |
| `scoutProfileId` | string (uuid) | Yes |
| `organization` | string | Yes |
| `country` | string | Yes |
| `experienceYears` | integer (int32) | Yes |
| `status` | string | Yes |
| `requestedAt` | string (date-time) | Yes |
| `respondedAt` | string (date-time) | Yes |

### `PlayerProfileDto`

| Field | Type | Required |
|-------|------|----------|
| `id` | string (uuid) | Yes |
| `fullName` | string | Yes |
| `dateOfBirth` | string (date-time) | Yes |
| `age` | integer (int32) | Yes |
| `country` | string | Yes |
| `city` | string|null | Yes |
| `height` | number (double) | Yes |
| `weight` | number (double) | Yes |
| `preferredFoot` | PreferredFoot | Yes |
| `primaryPosition` | Position | Yes |
| `secondaryPosition` | object | Yes |
| `currentClub` | string|null | Yes |
| `biography` | string|null | Yes |
| `profilePictureUrl` | string|null | Yes |
| `visibility` | ProfileVisibility | Yes |
| `isComplete` | boolean | Yes |

### `Position`

_No properties defined._

### `PreferredFoot`

_No properties defined._

### `ProblemDetails`

| Field | Type | Required |
|-------|------|----------|
| `type` | string|null | No |
| `title` | string|null | No |
| `status` | integer (int32) | No |
| `detail` | string|null | No |
| `instance` | string|null | No |

### `ProfileVisibility`

_No properties defined._

### `RefreshCommand`

| Field | Type | Required |
|-------|------|----------|
| `accessToken` | string | Yes |
| `refreshToken` | string | Yes |

### `RegisterPlayerCommand`

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |
| `fullName` | string | Yes |
| `dateOfBirth` | string (date-time) | Yes |
| `primaryPosition` | Position | Yes |
| `preferredFoot` | PreferredFoot | Yes |
| `country` | string | Yes |

### `RegisterScoutCommand`

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `password` | string | Yes |
| `organization` | string | Yes |
| `country` | string | Yes |
| `experienceYears` | integer (int32) | Yes |

### `RespondToContactRequestDto`

| Field | Type | Required |
|-------|------|----------|
| `accept` | boolean | No |

### `ScoutContactRequestDto`

| Field | Type | Required |
|-------|------|----------|
| `contactRequestId` | string (uuid) | Yes |
| `playerProfileId` | string (uuid) | Yes |
| `playerFullName` | string | Yes |
| `playerPosition` | string | Yes |
| `playerCountry` | string | Yes |
| `status` | string | Yes |
| `requestedAt` | string (date-time) | Yes |
| `respondedAt` | string (date-time) | Yes |
| `playerEmail` | string|null | No |

### `UpdateProfileCommand`

| Field | Type | Required |
|-------|------|----------|
| `city` | string|null | Yes |
| `height` | number (double) | Yes |
| `weight` | number (double) | Yes |
| `secondaryPosition` | object | Yes |
| `currentClub` | string|null | Yes |
| `biography` | string|null | Yes |
| `footballExperience` | string|null | Yes |
| `marketValue` | number (double) | Yes |
| `visibility` | ProfileVisibility | Yes |
