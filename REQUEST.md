# REQUEST: the flight API cheat sheet

An app sends a supported request to another system and reads the response. The interface lets it use a service while the service controls its own internal data and implementation.

**Worked illustration:** TripNote, SkyLine, flight 482, its delay, gate B12 and departure 7:40 are fictional teaching examples. They are not live travel data. `api.skyline.example` uses a reserved documentation domain. `EXAMPLE_TOKEN` is a visibly fake credential.

## The four terms

- **Request:** the message you send, including the method, address, required headers and any submitted content.
- **Endpoint:** the address for the operation or resource you want. Here, the request goes to `https://api.skyline.example/flights/482`.
- **Response:** the service's HTTP status, headers and any returned content. This example returns JSON fields that TripNote turns into a flight-status screen.
- **Webhook:** a supported event causes the service to send an HTTP request to a callback URL you registered. The airline initiates the notification to TripNote's backend, rather than TripNote repeatedly asking whether anything changed.

## Follow the worked exchange

1. TripNote's backend sends a GET request for flight 482 to the SkyLine endpoint.
2. The airline service checks the request and whether the caller may read that flight status.
3. In this illustration it looks up the permitted flight record. Internal passenger names, payment details and crew schedules stay behind the service boundary.
4. The airline returns an HTTP response with status and, on success, these example JSON fields:

```json
{
  "status": "Delayed",
  "gate": "B12",
  "departure": "7:40"
}
```

5. TripNote reads the fields and draws the flight screen. JSON is structured text data; HTTPS protects the transport. Other APIs can use other formats or compute an answer without a database lookup.

The companion `flight-request.http` file shows the request shape. It is an illustration rather than a working airline integration. The fake bearer credential belongs on the backend; do not embed a real secret in a phone app, public page or URL.

## Methods, access and limits

- **GET:** ask for a current representation of a resource. Its intended semantics are read-only.
- **POST:** submit content for the resource to process. It does not always mean “create a new record.”
- **Credentials:** the service may use an API key, access token or another scheme. A key can identify project/application traffic; do not assume it proves a user's identity or grants every permission. The service still checks allowed access. Bearer tokens need protection.
- **Rate limit:** a provider can cap calls within a period. A quota of 100 requests per minute per app is this film's invented example, not an HTTP standard. Quotas and counting rules vary.

## Read the status

| Code | Meaning in this model | What to check |
|---|---|---|
| 200 | The HTTP request succeeded. | Read the documented response fields; HTTP success does not mean the flight is on time. |
| 404 | The requested resource was not found at that address, or its existence is concealed. | Check the endpoint and identifier. It does not prove the real flight does not exist. |
| 429 | Too many requests within the provider's counting period. | Follow the provider's limits and any retry guidance. |

## The webhook direction

Register a callback URL and subscribe to a supported event. When that event happens, the airline sends a notification to TripNote's backend. The backend validates the sender and handles the event before updating its own screen.

Webhooks can give near-real-time updates. Delivery can be delayed or fail; a notification is not a guarantee of an instant screen change. Production integrations need the provider's security and failure-handling instructions.

## Keep this decision aid

Before calling a service, identify its endpoint and method, allowed credential/permissions, response fields and error statuses. When you need repeated changes, check whether it supports an appropriate webhook and how deliveries are secured and retried.

## Primary sources

Technical boundaries checked 5 October 2026; original card prepared 6 October 2026.

- [HTTP semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), sections 9.3.1, 9.3.3, 15.3.1 and 15.5.5.
- [HTTP 429, RFC 6585](https://www.rfc-editor.org/rfc/rfc6585.html#section-4).
- [JSON, RFC 8259](https://www.rfc-editor.org/rfc/rfc8259.html).
- [Bearer token protection, RFC 6750](https://www.rfc-editor.org/rfc/rfc6750.html).
- [API keys and authorization, Google Cloud Endpoints](https://docs.cloud.google.com/endpoints/docs/openapi/when-why-api-key).
- [Webhook behavior, GitHub](https://docs.github.com/en/webhooks/about-webhooks), [delivery failures](https://docs.github.com/en/webhooks/using-webhooks/handling-failed-webhook-deliveries), and [security/handling practices](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks).
- [Endpoint paths, OpenAPI](https://spec.openapis.org/oas/v3.1.0.html#paths-object).
- [Reserved example domains, RFC 2606](https://www.rfc-editor.org/rfc/rfc2606.html).

Internal provenance: original explanation/diagram prepared for the founder-selected DeD95vfRkvJ teaching sequence. No source finished footage, voice or art is included. Local review artifact only; public access and authorized recipient delivery remain unverified.
