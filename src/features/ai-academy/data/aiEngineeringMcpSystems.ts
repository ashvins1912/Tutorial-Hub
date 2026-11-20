import type { AcademyLesson, AcademyModule } from './aiEngineeringCurriculum';

const lesson = (item: AcademyLesson): AcademyLesson => item;

export const AI_MCP_SYSTEMS_MODULE: AcademyModule = {
  id: 'mcp-engineering',
  title: 'Model Context Protocol (MCP): architecture, implementation and production safety',
  outcome: 'Understand MCP end to end: protocol lifecycle, transports, tools, resources, prompts, authorization, failure handling, testing and production operations.',
  lessons: [
    lesson({
      id: 'mcp-fundamentals-architecture',
      title: 'MCP fundamentals: why the protocol exists and its architecture',
      level: 'Intermediate', duration: '70 min',
      why: 'Agent applications often integrate each data source and tool through a custom adapter. Every integration repeats discovery, schema, transport, error and lifecycle logic. MCP defines a common protocol boundary so hosts can connect to multiple capability servers without hard-coding every integration.',
      analogy: 'Think of MCP as a standard docking connector for software capabilities. The connector standardizes communication, but the host still decides which device is trusted, which permissions it receives and what the user may do.',
      explanation: 'Model Context Protocol is an open protocol for connecting AI applications to external context and capabilities. The main roles are host, client and server. The host is the user-facing AI application and owns orchestration, user context and policy. A host creates one or more MCP clients; each client maintains a protocol connection to a server. A server exposes capabilities such as tools, resources and prompts. A tool represents an operation the model may request; a resource exposes readable context; a prompt provides a reusable prompt template. MCP standardizes capability discovery and message exchange, not the business authorization decision. A server may run locally or remotely. Do not confuse an MCP server with the LLM: the server provides capabilities, while the host/model decides how to use them under host policy.',
      keyPoints: [
        'Host owns user interaction, orchestration and policy; client owns a server session; server exposes capabilities.',
        'A host can connect to multiple servers, each with its own trust boundary and permissions.',
        'Tools are invocable operations; resources are addressable context; prompts are reusable templates.',
        'MCP is a protocol boundary, not an agent framework, model, database or authorization system.',
        'Capability discovery never grants permission to execute a capability.'
      ],
      workedExample: 'A support assistant host connects to a read-only order server and a knowledge server. It discovers get_order_status and search_policy tools plus a policy resource. The host only exposes order lookup for the authenticated customer and never assumes that server discovery authorizes access to every order.',
      code: 'host = MCPHost(policy=host_policy)\norders = host.connect(server_config="orders-readonly")\nknowledge = host.connect(server_config="policy-library")\n\norder_tools = await orders.list_tools()\nresources = await knowledge.list_resources()\n# Host filters discovered capabilities using user and tenant policy.',
      steps: [
        {title:'Identify the host',detail:'Locate the application that owns the user session, model orchestration and policy.',input:'User request and application context',output:'Trusted host context',failure:'A server is incorrectly treated as the policy owner.'},
        {title:'Create client sessions',detail:'Create a separate client connection for each configured server.',input:'Server configuration',output:'Independent MCP client sessions',failure:'One failed server takes down unrelated integrations.'},
        {title:'Discover capabilities',detail:'Read tools, resources and prompts exposed by each server.',input:'Initialized session',output:'Capability catalogue',failure:'Discovered capabilities are automatically trusted.'},
        {title:'Apply host policy',detail:'Filter capabilities and bind them to user, tenant and risk rules.',input:'Catalogue and authenticated principal',output:'Allowed capability set',failure:'Model-selected tool bypasses authorization.'}
      ],
      question:{prompt:'Which component should make the final decision about whether a user may invoke a discovered MCP tool?',options:['The language model','The host and trusted server-side authorization layer','The tool description text','The transport protocol'],explanation:'MCP provides discovery and invocation contracts. Authorization remains an application and server responsibility.'},
      project:'Draw a host-client-server diagram for an assistant using two MCP servers. Mark the user identity, policy enforcement points, trust boundaries and which component owns each decision.',
      pitfalls:['Calling every MCP server an agent.','Assuming MCP automatically authenticates or authorizes users.','Giving every connected server identical permissions.','Confusing resources, prompts and tools.'],
      next:'MCP message lifecycle, JSON-RPC and capability negotiation'
    }),
    lesson({
      id: 'mcp-jsonrpc-lifecycle',
      title: 'MCP message lifecycle: JSON-RPC, initialization and capability negotiation',
      level: 'Intermediate', duration: '80 min',
      why: 'Interoperability depends on more than agreeing on endpoint URLs. Both sides must agree on protocol version, supported capabilities, request/response shapes and lifecycle behavior.',
      analogy: 'Before two teams exchange work orders, they agree on the form version, supported fields and which operations each team can handle. A message with the wrong shape or lifecycle state must be rejected clearly.',
      explanation: 'MCP messages use JSON-RPC 2.0 patterns: requests carry an id, method and optional params; responses correlate to the request id and contain either result or error; notifications have no response id. A typical session begins with initialize, where client and server negotiate protocol version and capabilities, followed by the initialized notification. The client then uses methods appropriate to the negotiated capabilities, such as listing tools or reading resources. Requests and responses must be correlated; concurrent requests may complete out of order. Notifications communicate events such as progress or capability changes without requiring a response. Implementations must handle unknown methods, malformed params, unsupported versions, cancellation and orderly shutdown. Never infer that a capability exists simply because a method name is familiar: inspect the negotiated capability set and handle absence explicitly.',
      keyPoints: [
        'JSON-RPC request IDs correlate responses; notifications do not expect a response.',
        'Initialize and capability negotiation happen before normal operations.',
        'Protocol version compatibility must be explicit and tested.',
        'Concurrent responses may arrive in a different order from requests.',
        'Unknown methods, invalid params and unsupported capabilities need bounded error handling.'
      ],
      workedExample: 'A client sends two read-only requests with IDs 41 and 42. The server completes request 42 first. The client must resolve each promise by ID rather than assuming response order. If the server does not advertise resource support, the client must not call resource listing as though it were guaranteed.',
      code: 'request = {"jsonrpc": "2.0", "id": 41, "method": "tools/list", "params": {}}\nresponse = {"jsonrpc": "2.0", "id": 41, "result": {"tools": []}}\nnotification = {"jsonrpc": "2.0", "method": "notifications/cancelled", "params": {"requestId": 41}}\n\nassert response["id"] == request["id"]',
      steps: [
        {title:'Initialize',detail:'Exchange protocol version and client/server capability declarations.',input:'Client identity and supported versions',output:'Negotiated session',failure:'No compatible protocol version.'},
        {title:'Mark ready',detail:'Complete initialization before issuing normal operations.',input:'Initialize result',output:'Ready session',failure:'Requests are sent before lifecycle completion.'},
        {title:'Correlate messages',detail:'Track request IDs and route results or errors to the correct caller.',input:'Concurrent JSON-RPC messages',output:'Correct request completion',failure:'Out-of-order responses are assigned to the wrong call.'},
        {title:'Close or recover',detail:'Cancel outstanding work and close the session cleanly.',input:'Shutdown or transport failure',output:'Released resources and explicit task status',failure:'Orphaned requests or leaked processes.'}
      ],
      question:{prompt:'Why must an MCP client correlate JSON-RPC responses by request ID?',options:['Responses are always returned in request order','Concurrent requests may complete out of order','Request IDs authenticate the user','Notifications always contain a response ID'],explanation:'Request IDs provide correlation when multiple operations are in flight and responses arrive out of order.'},
      project:'Implement a protocol-message simulator that validates request, response and notification shapes, negotiates a mock capability set and resolves concurrent responses by ID.',
      pitfalls:['Treating notifications as requests that need responses.','Assuming response order matches request order.','Skipping initialization and version checks.','Ignoring unknown-method and cancellation errors.'],
      next:'MCP transports: stdio, Streamable HTTP and operational trade-offs'
    }),
    lesson({
      id: 'mcp-transports-stdio-http',
      title: 'MCP transports: stdio, Streamable HTTP and connection design',
      level: 'Intermediate', duration: '85 min',
      why: 'A protocol can be correct while its transport is unreliable or unsafe. Transport choice changes process management, authentication, network exposure and operational behavior.',
      analogy: 'A conversation can happen over a private intercom or a managed telephone network. Both carry the same message, but setup, identity checks, failure handling and exposure differ.',
      explanation: 'MCP separates protocol semantics from transport. stdio is commonly used when a host launches a local server process and exchanges protocol messages over standard input/output. It avoids opening a network listener, but process lifecycle, executable path, environment variables and stderr/stdout discipline matter. Remote deployments use Streamable HTTP, where HTTP carries MCP messages and supports streaming behavior. Remote transport requires careful origin validation, authentication, TLS, session handling where applicable, request limits and network controls. Do not print logs to stdout in a stdio server because stdout is the protocol channel; send diagnostics to stderr. Do not expose a local stdio server by wrapping it in an unauthenticated HTTP proxy. Choose transport based on deployment topology and threat model, not convenience alone.',
      keyPoints: [
        'stdio suits host-managed local processes; stdout must remain protocol-clean.',
        'Streamable HTTP supports remote client/server communication and streaming responses.',
        'Remote endpoints need TLS, authentication, origin controls and request limits.',
        'Process startup, shutdown, timeouts and reconnection are part of transport reliability.',
        'Transport security does not replace tool-level authorization.'
      ],
      workedExample: 'A developer uses a local documentation MCP server through stdio. The host starts the process, sends protocol messages on stdin and reads responses from stdout. In production, a shared remote documentation server uses HTTPS, authenticated requests, tenant-scoped access and bounded streaming.',
      code: 'stdio_config = {"command": "python", "args": ["-m", "docs_mcp_server"]}\nremote_config = {"url": "https://mcp.example.internal/mcp", "transport": "streamable-http"}\n\n# Keep stdout reserved for protocol frames in stdio mode.\n# Send diagnostics to stderr; never place credentials in command arguments.',
      steps: [
        {title:'Choose topology',detail:'Decide whether the server is a host-launched local process or a remote shared service.',input:'Deployment and trust requirements',output:'Transport decision',failure:'A network listener is exposed without need.'},
        {title:'Configure channel',detail:'Set process command for stdio or authenticated HTTPS endpoint for remote transport.',input:'Server configuration',output:'Configured transport',failure:'Wrong executable, URL or environment.'},
        {title:'Protect the channel',detail:'Apply TLS, identity checks, origin policy, timeouts and payload limits where applicable.',input:'Transport connection',output:'Constrained channel',failure:'Spoofed origin, oversized payload or credential leak.'},
        {title:'Handle lifecycle',detail:'Manage startup, streaming, cancellation, reconnection and shutdown.',input:'Active session',output:'Predictable session lifecycle',failure:'Hung process or orphaned connection.'}
      ],
      question:{prompt:'In a stdio-based MCP server, where should diagnostic logs be written?',options:['Standard output, mixed with protocol messages','Standard error, keeping standard output for protocol traffic','The JSON-RPC request body','The client request ID'],explanation:'stdout is the protocol channel for stdio. Diagnostic output belongs on stderr so it cannot corrupt message framing.'},
      project:'Create a transport decision record for a local developer tool and a shared remote tool. Include process lifecycle, authentication, TLS, origin validation, logging and failure behavior.',
      pitfalls:['Writing debug output to stdout in stdio mode.','Exposing a remote server without authentication.','Putting secrets in process arguments or logs.','Assuming a healthy TCP connection means a healthy protocol session.'],
      next:'MCP capability model: tools, resources, prompts and subscriptions'
    }),
    lesson({
      id: 'mcp-tools-resources-prompts',
      title: 'MCP capabilities: tools, resources, prompts and subscriptions',
      level: 'Intermediate', duration: '90 min',
      why: 'Good MCP integrations expose capabilities with clear semantics. Choosing the wrong primitive makes authorization, user experience and caching harder to reason about.',
      analogy: 'A workplace has action buttons, reference documents and reusable checklists. They are related, but reading a policy document is not the same as submitting an expense.',
      explanation: 'Tools are named operations with descriptions and input schemas. A host can discover them, present or select them, validate arguments and request invocation. Resources are addressable data identified by URIs; clients can list or read them, and servers may support resource templates or change notifications. Prompts are reusable prompt templates that can accept declared arguments and return structured messages for a user or model workflow. Some servers support subscriptions or notifications for resource changes. Design tools around narrow business operations rather than generic execute_sql or run_shell interfaces. Keep resources read-scoped and avoid embedding secrets in resource contents. Prompt templates are convenience, not trusted policy: host system instructions and server authorization remain authoritative.',
      keyPoints: [
        'Tools perform operations; resources expose data; prompts provide reusable message templates.',
        'Tool schemas should be narrow, typed, bounded and documented.',
        'Resource URIs and templates need access checks and safe canonicalization.',
        'Subscriptions and notifications need lifecycle and backpressure handling.',
        'Do not expose broad shell, arbitrary SQL or unrestricted filesystem capabilities.'
      ],
      workedExample: 'A product support server exposes a read-only order resource template and get_order_status tool. A refund-policy prompt helps compose a response, but the host still verifies customer ownership and never treats the prompt text as authorization.',
      code: 'tool = {"name": "get_order_status", "inputSchema": {"type": "object", "properties": {"order_id": {"type": "string"}}, "required": ["order_id"]}}\nresource = {"uri": "orders://{order_id}", "mimeType": "application/json"}\nprompt = {"name": "explain_refund_policy", "arguments": [{"name": "region", "required": True}]}\n# Validate schemas and principal scope before reading or invoking.',
      steps: [
        {title:'Model the capability',detail:'Decide whether the user needs an operation, addressable context or reusable prompt template.',input:'User task',output:'Tool, resource or prompt contract',failure:'A broad tool is used for every operation.'},
        {title:'Define schema and scope',detail:'Specify arguments, return shape, URI rules and authorization requirements.',input:'Capability design',output:'Versioned contract',failure:'Unbounded or ambiguous inputs.'},
        {title:'Discover and present',detail:'Let the host inspect metadata and decide what to expose in context.',input:'Server capability catalogue',output:'Policy-filtered capability view',failure:'Untrusted metadata is rendered as trusted instruction.'},
        {title:'Invoke or read safely',detail:'Authorize, validate, bound output and audit access.',input:'User-scoped request',output:'Validated result',failure:'Cross-user data exposure or oversized response.'}
      ],
      question:{prompt:'Which MCP primitive best represents a read-only addressable policy document?',options:['Tool','Resource','Prompt template','Transport handshake'],explanation:'A resource is the protocol primitive for addressable context that a client can read.'},
      project:'Design an MCP server contract for a helpdesk domain with two read-only resources, two narrow tools and one prompt template. Define schemas, permissions and error cases.',
      pitfalls:['Using tools as generic unrestricted command execution.','Assuming resource URIs are secret or unguessable.','Treating prompt templates as security policy.','Returning unbounded resource contents.'],
      next:'Build a safe MCP tool server with schemas and deterministic handlers'
    }),
    lesson({
      id: 'mcp-server-implementation',
      title: 'Build an MCP server: tool contracts, validation and deterministic handlers',
      level: 'Advanced', duration: '100 min',
      why: 'A useful MCP server is a well-engineered API boundary. The protocol wrapper should remain thin while business logic, validation and authorization stay testable and deterministic.',
      analogy: 'A restaurant menu lists available dishes, but the kitchen still checks ingredients, allergies and order details before preparing anything.',
      explanation: 'Structure a server into protocol registration, capability metadata, input validation, principal resolution, authorization, domain service and response serialization. Give each tool a stable name, concise description, strict schema, bounded output and explicit error behavior. Separate protocol parsing from business logic so handlers can be unit-tested without a live MCP connection. Validate identifiers and enums, enforce pagination and timeouts, and avoid accepting user or tenant identity from model-supplied arguments. Resolve identity from trusted connection context or an authenticated host-mediated context. Return useful, non-sensitive errors; never return stack traces, credentials or raw database exceptions. Make side-effecting handlers idempotent where retries are possible.',
      keyPoints: [
        'Keep protocol adapters thin and domain services independently testable.',
        'Validate schema, domain invariants, identity and authorization on every call.',
        'Never trust model-supplied user_id or tenant_id as proof of identity.',
        'Bound pagination, execution time, output size and concurrency.',
        'Make mutations idempotent and require approval for consequential actions.'
      ],
      workedExample: 'A get_order_status tool accepts only order_id. The handler resolves the principal from trusted context, checks order ownership, calls a read-only service and returns a minimal status object. It does not accept customer_id from the model.',
      code: 'async def get_order_status(args, context):\n    order_id = OrderId.parse(args["order_id"])\n    principal = context.authenticated_principal\n    order = await orders.find_by_id(order_id)\n    if order is None or not policy.can_read_order(principal, order):\n        raise SafeToolError("ORDER_NOT_FOUND")\n    return {"status": order.status, "updated_at": order.updated_at.isoformat()}',
      steps: [
        {title:'Register narrow capability',detail:'Declare a stable tool name, description and strict input schema.',input:'Domain operation',output:'Discoverable MCP tool',failure:'Tool description promises more than handler can safely do.'},
        {title:'Validate request',detail:'Parse types, enums, IDs, ranges and maximum payload sizes.',input:'Untrusted tool arguments',output:'Typed domain command',failure:'Malformed or oversized arguments reach business logic.'},
        {title:'Authorize principal',detail:'Resolve identity from trusted context and enforce object-level access.',input:'Principal and typed command',output:'Authorized command',failure:'Model-controlled identity enables IDOR.'},
        {title:'Execute and serialize',detail:'Call deterministic service, map errors and bound returned data.',input:'Authorized command',output:'Safe protocol result',failure:'Raw exception, secret or excessive output leaks.'}
      ],
      question:{prompt:'Why should a tool not trust a model-supplied customer_id to authorize an order lookup?',options:['The model cannot generate strings','The identifier is input, not proof of the authenticated principal or ownership','MCP tools cannot accept IDs','Customer IDs must always be public'],explanation:'Identity must come from a trusted authentication context, and object-level authorization must be checked server-side.'},
      project:'Implement a mock read-only order MCP server contract. Add strict argument validation, principal-scoped ownership checks, bounded output, stable error codes and unit tests for unauthorized access.',
      pitfalls:['Accepting tenant/user identity from tool arguments.','Returning raw database records.','Using generic admin tools instead of narrow domain operations.','Making mutations retryable without idempotency.'],
      next:'MCP security: authentication, authorization, consent and prompt injection'
    }),
    lesson({
      id: 'mcp-security-trust-boundaries',
      title: 'MCP security: authentication, authorization, consent and untrusted content',
      level: 'Advanced', duration: '110 min',
      why: 'MCP connects an AI host to capabilities that may access private data or cause side effects. A protocol-compliant server can still be malicious, compromised, misconfigured or over-privileged.',
      analogy: 'A visitor badge lets someone enter a building lobby; it does not grant access to every office, safe or server room. Each sensitive door checks the person, purpose and permission.',
      explanation: 'Threat-model host, client, server, transport, model context and tool execution separately. Authenticate remote clients and servers using the deployment-approved identity mechanism; protect tokens in secret storage and never place credentials in prompts, tool descriptions or logs. Apply least privilege, per-user and per-tenant authorization, object-level checks, network egress controls, origin validation and rate limits. Treat tool metadata, resource content and tool results as untrusted data because they can carry prompt injection. Require informed user consent for sensitive access and explicit approval for high-impact side effects. Bind approvals to the exact action arguments, principal and expiry; invalidate approval if the payload changes. Keep a server allowlist and review provenance before connecting new servers. Do not assume a protocol-level authorization flow alone replaces application-level authorization.',
      keyPoints: [
        'Authenticate peers and authorize every operation; these are different controls.',
        'Use least-privilege credentials and scope permissions per user, tenant and capability.',
        'Treat server metadata, resource content and tool results as untrusted input.',
        'Bind consent and approval to exact scope and action arguments.',
        'Use server allowlists, egress controls, rate limits, audit trails and secret redaction.'
      ],
      workedExample: 'A third-party server advertises a tool that reads local files. The host rejects the server because it is not allowlisted. Even for an approved server, the host exposes only an approved directory and the server independently checks the authenticated user scope. A malicious document cannot expand that scope.',
      code: 'def authorize_mcp_call(principal, server, tool, args):\n    require_server_allowlisted(server.identity)\n    require_transport_authenticated(server.session)\n    validated = tool.schema.validate(args)\n    authorize_capability(principal, server, tool.name, validated)\n    enforce_tenant_scope(principal, validated)\n    enforce_budget_and_rate_limit(principal, tool)\n    require_bound_approval_if_sensitive(principal, tool, validated)\n    return validated',
      steps: [
        {title:'Map trust zones',detail:'Identify host, server, model context, data stores, credentials and external destinations.',input:'System architecture',output:'Threat model and assets',failure:'Server is assumed trusted because it speaks MCP.'},
        {title:'Authenticate and allowlist',detail:'Verify remote peer identity and approve only known server origins and configurations.',input:'Connection request',output:'Approved server session',failure:'Rogue server or origin accepted.'},
        {title:'Authorize each capability',detail:'Check principal, tenant, object scope, risk tier and action arguments.',input:'Tool/resource request',output:'Allowed or denied operation',failure:'Valid protocol request accesses another user’s data.'},
        {title:'Consent, audit and contain',detail:'Require explicit approval where needed; redact logs and constrain network egress.',input:'Sensitive operation',output:'Auditable bounded action',failure:'Prompt injection triggers data exfiltration or unapproved mutation.'}
      ],
      question:{prompt:'A tool server is authenticated and allowlisted. Does that mean every user can invoke every tool it exposes?',options:['Yes, server authentication grants universal access','No, each operation still requires principal- and resource-level authorization','Yes, if the model chooses the tool','No, MCP does not support authorization'],explanation:'Server trust and user authorization are separate. The server and host must enforce the authenticated user’s scope on every operation.'},
      project:'Threat-model an MCP server that exposes customer documents and ticket creation. Write at least 12 abuse cases covering rogue servers, prompt injection, cross-tenant reads, token leakage, SSRF, oversized output and approval bypass.',
      pitfalls:['Treating server authentication as user authorization.','Trusting instructions inside tool results.','Allowing arbitrary URLs or filesystem paths.','Logging bearer tokens or sensitive resource content.'],
      next:'MCP reliability: errors, timeouts, cancellation, progress and recovery'
    }),
    lesson({
      id: 'mcp-errors-cancellation-reliability',
      title: 'MCP reliability: errors, timeouts, cancellation, progress and recovery',
      level: 'Advanced', duration: '90 min',
      why: 'A remote tool can be slow, unavailable, partially successful or disconnected after a side effect. Without explicit failure semantics, agents retry blindly and may duplicate actions or claim success incorrectly.',
      analogy: 'If a courier app loses connection after a parcel is handed over, it cannot assume the parcel was not sent. It must reconcile the operation using a stable tracking reference.',
      explanation: 'Define timeouts at connection, request and domain-operation levels. Distinguish protocol errors from domain errors and transport failures. Use cancellation for work the caller no longer needs, but recognize that cancellation does not automatically roll back an already committed side effect. Progress notifications should be bounded and meaningful. Retry only transient failures and use exponential backoff with jitter, retry budgets and circuit breakers. For mutations, use idempotency keys or operation IDs and expose a status/reconciliation operation so a client can resolve uncertain outcomes. Limit concurrent calls and payload sizes. On disconnect, mark the outcome as unknown when appropriate instead of fabricating failure or success.',
      keyPoints: [
        'Separate protocol, transport and domain failures with stable error categories.',
        'Timeout and cancellation do not guarantee rollback of an already committed operation.',
        'Retry transient failures only; use bounded backoff, jitter and retry budgets.',
        'Use idempotency keys and reconciliation for side-effecting operations.',
        'Bound progress events, concurrency, payload size and total execution time.'
      ],
      workedExample: 'A create-ticket call times out after the server commits the ticket. The host does not blindly retry with a new request. It queries the operation ID or retries with the same idempotency key and receives the existing ticket reference.',
      code: 'async def create_ticket(command, idempotency_key):\n    existing = await operations.find(idempotency_key)\n    if existing:\n        return existing.result\n    return await operations.execute_once(\n        idempotency_key=idempotency_key,\n        command=command,\n        timeout_seconds=8\n    )',
      steps: [
        {title:'Classify failure',detail:'Determine whether the failure is protocol, transport, validation, authorization or domain-specific.',input:'Failed request',output:'Stable failure category',failure:'All errors are treated as retryable.'},
        {title:'Apply deadline and cancellation',detail:'Stop waiting or signal cancellation within a bounded deadline.',input:'Request deadline or cancel signal',output:'Cancelled or timed-out task state',failure:'Caller assumes cancellation undid a committed action.'},
        {title:'Retry safely',detail:'Retry only transient errors with backoff, jitter and the same idempotency key.',input:'Retryable failure',output:'Bounded retry attempt',failure:'Duplicate side effect or retry storm.'},
        {title:'Reconcile outcome',detail:'Query operation status when the result is uncertain after disconnect.',input:'Operation ID',output:'Confirmed result or explicit unknown state',failure:'System reports success without evidence.'}
      ],
      question:{prompt:'A create-order request times out after the server may have committed it. What is the safest next step?',options:['Retry with a new idempotency key','Assume the order failed','Reconcile using the same operation/idempotency key before attempting another mutation','Tell the user it succeeded'],explanation:'A timeout leaves the side-effect outcome uncertain. Reconciliation and idempotency prevent duplicate orders and false success claims.'},
      project:'Design a failure matrix for a tool that creates a ticket. Include server crash before commit, crash after commit, timeout, cancellation, duplicate request and status reconciliation.',
      pitfalls:['Retrying every error.','Assuming cancellation is transactional rollback.','Returning success after an uncertain timeout.','No idempotency or operation-status mechanism.'],
      next:'MCP testing, observability, versioning and production operations'
    }),
    lesson({
      id: 'mcp-testing-production',
      title: 'MCP testing and production operations: compatibility, observability and governance',
      level: 'Advanced', duration: '105 min',
      why: 'A server that works in a local inspector may fail under concurrency, protocol upgrades, remote authentication, malicious inputs or process restarts. Production quality requires compatibility and operational evidence.',
      analogy: 'A bridge is not certified because one car crossed it. Engineers test load, weather, emergency behavior, inspection intervals and repair procedures.',
      explanation: 'Build layered tests: unit tests for domain handlers, schema tests for tool contracts, protocol tests for initialization and message correlation, integration tests for transports, security tests for authorization and adversarial content, and load/failure tests for concurrency and recovery. Maintain compatibility fixtures for supported protocol versions and clients. Version tool schemas deliberately and treat breaking changes as API migrations. Observe connection success, initialization failures, tool latency, error categories, cancellation, retries, output size and policy denials. Use correlation IDs while redacting credentials and private content. Maintain a server inventory with owner, source, version, permissions, data access, review date and revocation procedure. Roll out changes gradually and keep a kill switch to disable a server or capability.',
      keyPoints: [
        'Test protocol lifecycle, capability negotiation, schemas, transports and domain authorization separately.',
        'Maintain compatibility fixtures and version tool contracts deliberately.',
        'Monitor latency, errors, retries, cancellations, denials and output size.',
        'Inventory servers with owners, provenance, permissions and revocation procedures.',
        'Use staged rollout, rollback and a capability/server kill switch.'
      ],
      workedExample: 'A server upgrade renames an input field from orderId to order_id. Contract tests detect the breaking change before release. A canary host validates compatibility, latency and authorization-denial metrics before the new version is enabled broadly.',
      code: 'quality_gates = {\n    "protocol_initialize": "pass",\n    "tool_schema_contracts": "pass",\n    "tenant_authorization": "pass",\n    "prompt_injection_suite": "pass",\n    "p95_tool_latency_ms": 800,\n    "retry_budget_exceeded": 0\n}\n# Release only when required gates pass; preserve rollback and disable controls.',
      steps: [
        {title:'Build test layers',detail:'Test handlers, schemas, protocol lifecycle, transport and authorization independently.',input:'Server implementation',output:'Layered test suite',failure:'Only happy-path manual testing exists.'},
        {title:'Exercise adversarial and failure cases',detail:'Test malicious resources, invalid schemas, timeouts, duplicate mutations and cross-tenant attempts.',input:'Threat model and failure matrix',output:'Security and resilience evidence',failure:'Hidden failure modes remain untested.'},
        {title:'Instrument and inventory',detail:'Record safe operational metadata and server provenance/permissions.',input:'Running MCP server',output:'Trace metrics and governance record',failure:'No owner or revocation path for a connected server.'},
        {title:'Release with controls',detail:'Canary protocol changes and preserve rollback and kill-switch behavior.',input:'Validated release candidate',output:'Controlled production rollout',failure:'Breaking change reaches every client at once.'}
      ],
      question:{prompt:'Which change should trigger MCP contract compatibility testing?',options:['Only a change to server logo','A tool name, input schema, output shape or protocol-version change','A change to an unrelated CSS class','Only a change in developer comments'],explanation:'Tool contracts and protocol compatibility are integration surfaces. Changes to names, schemas, outputs and versions can break clients.'},
      project:'Create a production-readiness checklist and test plan for one MCP server. Include compatibility fixtures, schema tests, security cases, p95 latency, error budgets, server inventory, rollback and emergency disable.',
      pitfalls:['Testing only through a local inspector.','Changing tool schemas without version discipline.','Logging complete prompts and tool payloads.','No owner, review date or revocation path for servers.'],
      next:'MCP capstone: connect a bounded host to multiple mock servers safely'
    }),
    lesson({
      id: 'mcp-capstone',
      title: 'MCP capstone: design a secure multi-server agent integration',
      level: 'Advanced', duration: '150 min',
      why: 'The capstone proves that MCP is understood as a complete integration boundary: protocol, host policy, server implementation, transport, security and operations must work together.',
      analogy: 'This is an architecture review and incident drill combined. The system must demonstrate normal operation, deny unsafe requests, recover from failures and explain exactly what it can access.',
      explanation: 'Design a local-only learning system with a host and two mock MCP servers: a read-only knowledge server and a read-only order server. The host initializes each client, negotiates capabilities, discovers tools/resources/prompts and builds a policy-filtered catalogue. It authenticates the simulated user, scopes order reads to that user, treats resource contents as untrusted, validates tool arguments, bounds calls and records redacted traces. Add a simulated high-impact mutation that is denied by default or requires an exact human approval token. Include transport failure, timeout-after-commit, duplicate request, incompatible protocol version, malicious resource and cross-tenant access scenarios. No real external account, shell execution or external side effect is required.',
      keyPoints: [
        'Keep the host as the policy and orchestration owner.',
        'Use independent mock servers and explicit capability contracts.',
        'Enforce authorization on both host and server sides.',
        'Demonstrate idempotency, cancellation, bounded execution and reconciliation.',
        'Prove behavior with protocol, security, compatibility and failure tests.'
      ],
      workedExample: 'A learner asks for the status of order A-100. The host chooses the order server, validates the order ID and user scope, calls the read-only tool and presents the result. A malicious knowledge resource asks the agent to list every customer order; the host treats it as untrusted text and the server rejects the out-of-scope query.',
      code: 'policy = {"allowed_servers": ["knowledge-mock", "orders-mock"], "max_calls": 5, "deadline_seconds": 20}\n\nasync def handle(question, principal):\n    sessions = await connect_and_initialize(policy["allowed_servers"])\n    catalogue = await discover_and_filter(sessions, principal)\n    plan = await propose_bounded_plan(question, catalogue)\n    for call in plan.calls[:policy["max_calls"]]:\n        args = validate_schema(call)\n        authorize(principal, call.server, call.tool, args)\n        result = await invoke_with_deadline(call, args, policy["deadline_seconds"])\n        record_redacted_trace(call, result)\n    return answer_from_validated_results()',
      steps: [
        {title:'Specify and model trust',detail:'Document host, clients, mock servers, users, resources, tools and prohibited actions.',input:'Capstone brief',output:'Architecture and threat model',failure:'No explicit trust boundary or threat actor.'},
        {title:'Implement protocol flow',detail:'Initialize clients, negotiate capabilities and discover available contracts.',input:'Mock servers',output:'Connected and policy-filtered capability catalogue',failure:'Unsupported capability is invoked.'},
        {title:'Enforce policy and resilience',detail:'Apply identity scope, schema validation, budgets, approval, idempotency and cancellation.',input:'User request and candidate tool call',output:'Authorized bounded execution',failure:'Prompt injection or retry duplicates a side effect.'},
        {title:'Verify and present evidence',detail:'Run compatibility, adversarial, failure and load tests; document limitations.',input:'Implementation and test fixtures',output:'Trace-backed release decision',failure:'A successful demo is mistaken for production readiness.'}
      ],
      question:{prompt:'What is the strongest evidence that the capstone is ready for a controlled pilot?',options:['The model can describe MCP accurately','A passing suite covering protocol compatibility, authorization, adversarial inputs, idempotency and failure recovery','The server exposes many tools','The host automatically accepts every discovered capability'],explanation:'A pilot requires evidence across protocol behavior, security, resilience and operational controls—not just capability discovery or a fluent demo.'},
      project:'Deliver a system diagram, two mock server contracts, capability catalogue, threat model, 25-case test suite, redacted trace examples, failure matrix and release/rollback checklist. Keep all execution local and simulated.',
      pitfalls:['Treating the MCP server as a trusted policy engine for all users.','Allowing discovered tools without host approval.','Skipping adversarial and timeout-after-commit tests.','Claiming production readiness without real environment and security review.'],
      next:'Specialization: advanced MCP gateways, multi-tenant governance and agent interoperability'
    })
  ]
};
