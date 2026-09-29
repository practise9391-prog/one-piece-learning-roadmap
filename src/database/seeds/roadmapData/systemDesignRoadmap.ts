import { CourseRoadmapSeed } from './types';

export const systemDesignRoadmap: CourseRoadmapSeed = {
  courseId: 'system_design',
  modules: [
    {
        "title": "Level 0 — Computer Fundamentals",
        "description": "Master CPU, RAM, storage, processes, threads, network sockets, ports, and foundational computer architecture.",
        "icon": "hardware-chip-outline",
        "topics": [
            "CPU",
            "RAM",
            "Storage",
            "Operating System",
            "Processes",
            "Threads",
            "Files",
            "Networking basics",
            "IP addresses",
            "Ports",
            "Protocols",
            "HTTP",
            "HTTPS",
            "TCP",
            "UDP",
            "DNS",
            "Basic client/server concepts"
        ]
    },
    {
        "title": "Level 1 — What Is System Design?",
        "description": "Understand why system design is essential, functional vs non-functional requirements, and architectural thinking.",
        "icon": "bulb-outline",
        "topics": [
            "What system design means",
            "Why system design is required",
            "System design vs coding",
            "Functional requirements",
            "Non-functional requirements",
            "Scalability",
            "Availability",
            "Reliability",
            "Performance",
            "Maintainability",
            "Security",
            "Cost",
            "Trade-offs"
        ]
    },
    {
        "title": "Level 2 — Client-Server Architecture",
        "description": "Explore request-response cycles, client types, web servers, backend layers, and child-level restaurant analogies.",
        "icon": "git-compare-outline",
        "topics": [
            "Client",
            "Server",
            "Request",
            "Response",
            "Stateless server",
            "Stateful server",
            "Database",
            "Client \u2192 Server \u2192 Database",
            "Multiple clients",
            "Multiple servers"
        ]
    },
    {
        "title": "Level 3 — How the Internet Works",
        "description": "Understand DNS resolution, IP routing, domains, protocols, latency, and how packets travel across the world.",
        "icon": "globe-outline",
        "topics": [
            "Browser",
            "DNS",
            "Domain",
            "IP address",
            "Router",
            "ISP",
            "TCP",
            "TLS",
            "HTTP/HTTPS",
            "Request journey",
            "Response journey"
        ]
    },
    {
        "title": "Level 4 — Web Application Architecture",
        "description": "Deconstruct modern web systems: frontend clients, backend compute, database storage, and API contracts.",
        "icon": "layers-outline",
        "topics": [
            "Frontend",
            "Backend",
            "Database",
            "API",
            "Web server",
            "Application server",
            "Reverse proxy",
            "Basic three-tier architecture"
        ]
    },
    {
        "title": "Level 5 — APIs",
        "description": "Deep-dive into REST, HTTP verbs, status codes, query parameters, payloads, gRPC, and GraphQL principles.",
        "icon": "swap-horizontal-outline",
        "topics": [
            "API definition",
            "REST API",
            "HTTP methods",
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "Request body",
            "Headers",
            "Authentication",
            "Status codes",
            "API versioning",
            "Pagination",
            "API design principles"
        ]
    },
    {
        "title": "Level 6 — Databases",
        "description": "Compare SQL and NoSQL, schema design, ACID properties, normalization, indexing, and storage engines.",
        "icon": "server-outline",
        "topics": [
            "Database fundamentals",
            "SQL databases",
            "NoSQL databases",
            "Tables",
            "Rows",
            "Columns",
            "Primary keys",
            "Foreign keys",
            "Indexes",
            "Relationships",
            "Transactions",
            "Normalization",
            "Denormalization"
        ]
    },
    {
        "title": "Level 7 — Performance Fundamentals",
        "description": "Grasp latency vs throughput, response times, network overhead, bottlenecks, and the 99th percentile.",
        "icon": "speedometer-outline",
        "topics": [
            "Latency",
            "Throughput",
            "Response time",
            "CPU",
            "Memory",
            "Disk I/O",
            "Network latency",
            "Database latency",
            "Bottlenecks",
            "Performance measurement"
        ]
    },
    {
        "title": "Level 8 — Scaling",
        "description": "Understand vertical scaling limits, horizontal scale-out architecture, stateless tiers, and elasticity.",
        "icon": "trending-up-outline",
        "topics": [
            "Vertical scaling",
            "Horizontal scaling",
            "Scaling limitations",
            "Stateless architecture",
            "Server replication",
            "Distributed systems basics"
        ]
    },
    {
        "title": "Level 9 — Load Balancing",
        "description": "Explore L4 vs L7 load balancing, health checks, Round Robin, Least Connections, and reverse proxies.",
        "icon": "git-network-outline",
        "topics": [
            "Why load balancers are needed",
            "Load balancer architecture",
            "Round robin",
            "Least connections",
            "Health checks",
            "Session persistence",
            "Reverse proxy",
            "Multiple application servers"
        ]
    },
    {
        "title": "Level 10 — Caching",
        "description": "Learn cache-aside, write-through, cache invalidation, Redis, Memcached, eviction policies (LRU/LFU), and stampede protection.",
        "icon": "flash-outline",
        "topics": [
            "What caching means",
            "Why caching is needed",
            "Cache hit",
            "Cache miss",
            "Cache-aside",
            "Write-through",
            "Write-back",
            "TTL",
            "Eviction",
            "LRU",
            "Redis",
            "Cache invalidation"
        ]
    },
    {
        "title": "Level 11 — CDN",
        "description": "Accelerate static and media delivery globally with edge caching, PoPs, origin shields, and cache TTLs.",
        "icon": "earth-outline",
        "topics": [
            "CDN",
            "Edge servers",
            "Origin server",
            "Static content",
            "Images",
            "CSS",
            "JavaScript",
            "Video",
            "Geographic distribution",
            "Cache at edge"
        ]
    },
    {
        "title": "Level 12 — Database Scaling",
        "description": "Master read replicas, master-slave failover, vertical vs horizontal partitioning, and database sharding keys.",
        "icon": "grid-outline",
        "topics": [
            "Read replicas",
            "Write replicas",
            "Replication",
            "Primary/replica architecture",
            "Database sharding",
            "Partitioning",
            "Read/write separation"
        ]
    },
    {
        "title": "Level 13 — Consistency",
        "description": "Explore strong vs eventual consistency, read-your-writes, causal consistency, and linearizability guarantees.",
        "icon": "shield-checkmark-outline",
        "topics": [
            "Strong consistency",
            "Eventual consistency",
            "Read-after-write consistency",
            "Consistency trade-offs",
            "Distributed data consistency"
        ]
    },
    {
        "title": "Level 14 — CAP Theorem",
        "description": "Demystify Brewer’s theorem: Consistency, Availability, Partition tolerance trade-offs in real distributed clusters.",
        "icon": "triangle-outline",
        "topics": [
            "Consistency",
            "Availability",
            "Partition tolerance",
            "CAP theorem",
            "Network partition",
            "Real-world examples",
            "CAP trade-offs"
        ]
    },
    {
        "title": "Level 15 — Availability & Reliability",
        "description": "Design for high availability (HA), SLAs, 99.999% uptime, redundancy, MTBF, MTTR, and graceful degradation.",
        "icon": "pulse-outline",
        "topics": [
            "Availability",
            "Reliability",
            "Uptime",
            "SLA",
            "SLO",
            "SLI",
            "Error budgets",
            "Redundancy",
            "Failure scenarios"
        ]
    },
    {
        "title": "Level 16 — Fault Tolerance",
        "description": "Implement resilient systems with health checks, circuit breakers, exponential backoff, dead-letter queues, and chaos engineering.",
        "icon": "shield-outline",
        "topics": [
            "Failure detection",
            "Retry",
            "Timeout",
            "Circuit breaker",
            "Fallback",
            "Redundancy",
            "Failover",
            "Graceful degradation"
        ]
    },
    {
        "title": "Level 17 — Message Queues",
        "description": "Decouple services asynchronously with producers, consumers, message brokers, push vs pull, and point-to-point queues.",
        "icon": "file-tray-full-outline",
        "topics": [
            "Queue",
            "Producer",
            "Consumer",
            "Worker",
            "Asynchronous processing",
            "Retry",
            "Dead-letter queue",
            "Message ordering"
        ]
    },
    {
        "title": "Level 18 — Kafka",
        "description": "Master Apache Kafka: topics, partitions, consumer groups, brokers, offsets, retention, and event streaming.",
        "icon": "logo-buffer",
        "topics": [
            "Kafka",
            "Producer",
            "Consumer",
            "Topic",
            "Partition",
            "Offset",
            "Consumer group",
            "Replication",
            "Ordering",
            "Kafka architecture",
            "Kafka use cases"
        ]
    },
    {
        "title": "Level 19 — Distributed Systems",
        "description": "Grasp distributed system fundamentals: independent nodes, network unreliability, partial failures, and split-brain.",
        "icon": "share-social-outline",
        "topics": [
            "Distributed system definition",
            "Distributed computing",
            "Nodes",
            "Network failures",
            "Replication",
            "Coordination",
            "Consistency",
            "Availability",
            "Fault tolerance"
        ]
    },
    {
        "title": "Level 20 — Distributed Communication",
        "description": "Compare synchronous RPC, asynchronous pub/sub, gRPC protobufs, message queues, and event streams.",
        "icon": "chatbubbles-outline",
        "topics": [
            "RPC",
            "REST",
            "gRPC",
            "Message-based communication",
            "Synchronous communication",
            "Asynchronous communication"
        ]
    },
    {
        "title": "Level 21 — Service Discovery",
        "description": "Learn how services dynamically locate each other using Consul, Eureka, ZooKeeper, and client/server-side discovery.",
        "icon": "compass-outline",
        "topics": [
            "Service discovery",
            "Service registry",
            "Client-side discovery",
            "Server-side discovery",
            "DNS-based discovery",
            "Dynamic services"
        ]
    },
    {
        "title": "Level 22 — Microservices",
        "description": "Deconstruct monolithic architectures into loosely coupled domain microservices, defining clear boundaries.",
        "icon": "apps-outline",
        "topics": [
            "Monolith",
            "Microservices",
            "Service boundaries",
            "Independent deployment",
            "Communication",
            "Service ownership",
            "Advantages",
            "Problems",
            "When to use microservices"
        ]
    },
    {
        "title": "Level 23 — API Gateway",
        "description": "Centralize routing, authentication, SSL termination, request transformation, and protocol conversion with an API Gateway.",
        "icon": "exit-outline",
        "topics": [
            "API Gateway",
            "Routing",
            "Authentication",
            "Rate limiting",
            "Request transformation",
            "Aggregation",
            "Logging"
        ]
    },
    {
        "title": "Level 24 — Rate Limiting",
        "description": "Protect downstream services using token bucket, leaky bucket, fixed window, sliding window counter algorithms.",
        "icon": "timer-outline",
        "topics": [
            "Why rate limiting is needed",
            "Requests per second",
            "Token bucket",
            "Leaky bucket",
            "Fixed window",
            "Sliding window",
            "Distributed rate limiting"
        ]
    },
    {
        "title": "Level 25 — Authentication & Authorization",
        "description": "Implement OAuth2, JWT access tokens, session stores, RBAC, ABAC, and single sign-on (SSO) architecture.",
        "icon": "key-outline",
        "topics": [
            "Authentication",
            "Authorization",
            "Sessions",
            "Cookies",
            "JWT",
            "OAuth",
            "Roles",
            "Permissions",
            "Access control"
        ]
    },
    {
        "title": "Level 26 — Security",
        "description": "Secure architectures with HTTPS/TLS, encryption at rest/transit, salted hashing, CORS, and DDoS mitigation.",
        "icon": "lock-closed-outline",
        "topics": [
            "HTTPS",
            "Encryption",
            "Hashing",
            "Password security",
            "Secrets",
            "SQL injection",
            "XSS",
            "CSRF",
            "Authentication security",
            "Authorization security",
            "API security"
        ]
    },
    {
        "title": "Level 27 — Distributed Transactions",
        "description": "Handle multi-service consistency using Two-Phase Commit (2PC), Saga orchestrator/choreography, and idempotency.",
        "icon": "repeat-outline",
        "topics": [
            "Transactions",
            "Distributed transactions",
            "Two-phase commit",
            "Saga pattern",
            "Compensation",
            "Transaction consistency"
        ]
    },
    {
        "title": "Level 28 — Event-Driven Architecture",
        "description": "Design reactive, real-time reactive architectures with events, event logs, publishers, subscribers, and broker topologies.",
        "icon": "radio-outline",
        "topics": [
            "Events",
            "Producers",
            "Consumers",
            "Event brokers",
            "Event-driven systems",
            "Event processing",
            "Asynchronous architecture"
        ]
    },
    {
        "title": "Level 29 — Important Distributed-System Patterns",
        "description": "Master critical reliability patterns: Retry, Exponential Backoff, Circuit Breaker, Bulkhead, Outbox, and Saga.",
        "icon": "shapes-outline",
        "topics": [
            "Retry Pattern with Jitter",
            "Timeout Pattern",
            "Circuit Breaker Pattern",
            "Bulkhead Isolation Pattern",
            "Saga Orchestration & Choreography",
            "Transactional Outbox Pattern",
            "Idempotency Key Pattern",
            "Leader Election Pattern",
            "Master-Replica Replication Pattern",
            "Automatic Failover Pattern"
        ]
    },
    {
        "title": "Level 30 — Consistent Hashing",
        "description": "Distribute load across dynamic clusters evenly with hash rings, virtual nodes, and minimal remapping.",
        "icon": "pie-chart-outline",
        "topics": [
            "Consistent hashing",
            "Hashing",
            "Hash ring",
            "Nodes",
            "Virtual nodes",
            "Data distribution",
            "Adding/removing servers",
            "Distributed cache use cases"
        ]
    },
    {
        "title": "Level 31 — Consensus",
        "description": "Understand distributed agreement, leader election, split-brain resolution, and Raft/Paxos consensus algorithms.",
        "icon": "people-outline",
        "topics": [
            "Consensus",
            "Leader election",
            "Raft",
            "Paxos concept",
            "Distributed agreement",
            "Failure scenarios"
        ]
    },
    {
        "title": "Level 32 — Distributed Locks",
        "description": "Prevent concurrent race conditions in distributed environments using Redis Redlock and ZooKeeper ephemeral nodes.",
        "icon": "lock-open-outline",
        "topics": [
            "Why distributed locks are required",
            "Lock ownership",
            "Redis locks",
            "Lock expiration",
            "Deadlocks",
            "Distributed coordination"
        ]
    },
    {
        "title": "Level 33 — Distributed IDs",
        "description": "Generate unique, ordered, collision-free 64-bit identifiers at scale using Twitter Snowflake and Ticket Servers.",
        "icon": "barcode-outline",
        "topics": [
            "Why distributed systems need unique IDs",
            "UUID",
            "Auto increment limitations",
            "Snowflake IDs",
            "Timestamp-based IDs",
            "Distributed ID generation"
        ]
    },
    {
        "title": "Level 34 — Storage Systems",
        "description": "Compare object storage (S3/GCS), block storage (EBS), and distributed file systems (NFS/HDFS) for scalable media.",
        "icon": "save-outline",
        "topics": [
            "Block storage",
            "Object storage",
            "File storage",
            "Distributed storage",
            "Replication",
            "Durability",
            "Amazon S3-style architecture"
        ]
    },
    {
        "title": "Level 35 — Search Systems",
        "description": "Build fast full-text search with inverted indexes, document scoring (TF-IDF/BM25), Elasticsearch, and Lucene.",
        "icon": "search-outline",
        "topics": [
            "Search architecture",
            "Indexing",
            "Inverted index",
            "Full-text search",
            "Elasticsearch-style architecture",
            "Search autocomplete",
            "Ranking basics"
        ]
    },
    {
        "title": "Level 36 — Observability",
        "description": "Monitor distributed architectures with the three pillars: structured logs, Prometheus metrics, and distributed tracing.",
        "icon": "eye-outline",
        "topics": [
            "Logs",
            "Metrics",
            "Traces",
            "Monitoring",
            "Alerting",
            "Distributed tracing",
            "Dashboards",
            "Debugging distributed systems"
        ]
    },
    {
        "title": "Level 37 — Deployment & Infrastructure",
        "description": "Package and orchestrate scalable deployments with Docker containers, Kubernetes clusters, and CI/CD pipelines.",
        "icon": "cloud-upload-outline",
        "topics": [
            "Servers",
            "Containers",
            "Docker",
            "Kubernetes fundamentals",
            "CI/CD",
            "Reverse proxy",
            "Cloud infrastructure",
            "Infrastructure as code basics"
        ]
    },
    {
        "title": "Level 38 — Autoscaling",
        "description": "Scale compute instances automatically in response to CPU, memory, request queue depth, and predictive metrics.",
        "icon": "expand-outline",
        "topics": [
            "Horizontal autoscaling",
            "Vertical scaling",
            "CPU-based scaling",
            "Memory-based scaling",
            "Request-based scaling",
            "Kubernetes autoscaling concepts"
        ]
    },
    {
        "title": "Level 39 — Disaster Recovery",
        "description": "Plan for catastrophic outages with RTO, RPO, cold/warm/hot standbys, automated backups, and multi-AZ failovers.",
        "icon": "medkit-outline",
        "topics": [
            "Backup",
            "Restore",
            "Disaster recovery",
            "RTO",
            "RPO",
            "Failover",
            "Backup strategies",
            "Recovery testing"
        ]
    },
    {
        "title": "Level 40 — Multi-Region Architecture",
        "description": "Design global architectures with active-active / active-passive setups, GeoDNS routing, and data replication.",
        "icon": "map-outline",
        "topics": [
            "Multiple regions",
            "Active-active",
            "Active-passive",
            "Global traffic routing",
            "Replication",
            "Disaster recovery",
            "Regional failure"
        ]
    },
    {
        "title": "Level 41 — Advanced Database Architecture",
        "description": "Implement multi-master clusters, distributed schema migrations, and column-family stores (Cassandra).",
        "icon": "albums-outline",
        "topics": [
            "Advanced sharding",
            "Partitioning",
            "Replication",
            "Distributed databases",
            "Leader/follower architecture",
            "Multi-leader replication",
            "Conflict resolution"
        ]
    },
    {
        "title": "Level 42 — Advanced Caching",
        "description": "Master two-level caching (local L1 + distributed L2), cache stampede mitigation, and dogpiling prevention.",
        "icon": "flame-outline",
        "topics": [
            "Distributed caching",
            "Cache consistency",
            "Cache invalidation",
            "Cache stampede",
            "Cache warming",
            "Distributed cache architecture"
        ]
    },
    {
        "title": "Level 43 — Reliability Patterns",
        "description": "Build bulletproof systems using rate shedding, rate limiting, fallbacks, bulkheads, and automated self-healing.",
        "icon": "fitness-outline",
        "topics": [
            "Retry",
            "Timeout",
            "Circuit breaker",
            "Bulkhead",
            "Failover",
            "Redundancy",
            "Graceful degradation",
            "Backpressure",
            "Idempotency"
        ]
    },
    {
        "title": "Level 44 — Design Patterns for System Architecture",
        "description": "Apply architectural blueprints: Hexagonal/Ports-and-Adapters, Clean Architecture, and the Strangler Fig pattern.",
        "icon": "cube-outline",
        "topics": [
            "Layered (N-Tier) Architecture",
            "Client-Server Pattern",
            "Event-Driven Architecture",
            "Microservices Architecture",
            "Service-Oriented Architecture (SOA)",
            "Publish/Subscribe Messaging Pattern",
            "CQRS Architectural Pattern",
            "Saga Distributed Transaction Pattern",
            "Strangler Fig Migration Pattern"
        ]
    },
    {
        "title": "Level 45 — CQRS",
        "description": "Segregate read and write models with Command Query Responsibility Segregation for ultra-high read throughput.",
        "icon": "git-branch-outline",
        "topics": [
            "Command",
            "Query",
            "Command model",
            "Query model",
            "Read/write separation",
            "CQRS architecture",
            "Advantages",
            "Trade-offs"
        ]
    },
    {
        "title": "Level 46 — Event Sourcing",
        "description": "Store application state changes as an immutable append-only event stream with state reconstitution and snapshots.",
        "icon": "journal-outline",
        "topics": [
            "Events",
            "Event store",
            "Event replay",
            "Current state reconstruction",
            "Event sourcing architecture",
            "Advantages",
            "Trade-offs"
        ]
    },
    {
        "title": "Level 47 — Data Pipelines",
        "description": "Ingest, transform, and load massive data streams using ETL/ELT pipelines, Apache Spark, and data warehouses.",
        "icon": "git-commit-outline",
        "topics": [
            "Data ingestion",
            "Processing",
            "Transformation",
            "Storage",
            "ETL",
            "ELT",
            "Batch pipelines",
            "Streaming pipelines"
        ]
    },
    {
        "title": "Level 48 — Batch vs Stream Processing",
        "description": "Compare bounded historical batch processing with unbounded low-latency real-time stream processing.",
        "icon": "sync-outline",
        "topics": [
            "Batch processing",
            "Stream processing",
            "Real-time processing",
            "Latency differences",
            "Use cases",
            "Trade-offs"
        ]
    },
    {
        "title": "Level 49 — MapReduce",
        "description": "Understand distributed massive-data computing: Map stage, Shuffle and Sort phase, and Reduce aggregation.",
        "icon": "analytics-outline",
        "topics": [
            "Map",
            "Shuffle",
            "Reduce",
            "Distributed processing",
            "Large-scale data processing"
        ]
    },
    {
        "title": "Level 50 — Real-Time Systems",
        "description": "Deliver millisecond updates using WebSockets, Server-Sent Events (SSE), HTTP Long Polling, and connection pools.",
        "icon": "time-outline",
        "topics": [
            "Real-time architecture",
            "WebSockets",
            "Server-Sent Events",
            "Real-time messaging",
            "Presence",
            "Live updates",
            "Notifications",
            "Chat architecture"
        ]
    },
    {
        "title": "Level 51 — File Upload Architecture",
        "description": "Architect robust file uploads with presigned URLs, multipart chunking, direct-to-S3 storage, and resume support.",
        "icon": "cloud-outline",
        "topics": [
            "File upload",
            "Multipart upload",
            "Object storage",
            "Presigned URLs",
            "Large file uploads",
            "Resumable uploads",
            "CDN delivery"
        ]
    },
    {
        "title": "Level 52 — Media/Video Architecture",
        "description": "Stream video content at scale using adaptive bitrate streaming (HLS/DASH), asynchronous transcoding, and CDNs.",
        "icon": "videocam-outline",
        "topics": [
            "Video upload",
            "Video processing",
            "Transcoding",
            "Compression",
            "Storage",
            "CDN",
            "Streaming",
            "Adaptive bitrate"
        ]
    },
    {
        "title": "Level 53 — Notifications",
        "description": "Deliver multi-channel notifications (Push, Email, SMS) with priority queues, rate limits, and template engines.",
        "icon": "notifications-outline",
        "topics": [
            "Push notifications",
            "Email",
            "SMS",
            "Notification queues",
            "Notification workers",
            "Retry",
            "Delivery status",
            "Large-scale notification architecture"
        ]
    },
    {
        "title": "Level 54 — Payments Architecture",
        "description": "Design fault-tolerant payment flows with idempotency keys, payment gateways (Stripe), webhooks, and ledger reconciliation.",
        "icon": "card-outline",
        "topics": [
            "Payment gateway",
            "Orders",
            "Transactions",
            "Idempotency",
            "Payment status",
            "Webhooks",
            "Retry",
            "Fraud considerations",
            "Payment consistency"
        ]
    },
    {
        "title": "Level 55 — E-Commerce Architecture",
        "description": "Architect a full-scale e-commerce platform: catalog, search, shopping cart, checkout, inventory reservation, and orders.",
        "icon": "cart-outline",
        "topics": [
            "User Accounts & Authentication Tier",
            "Product Catalog & Inventory Service",
            "Elasticsearch Product Search & Filters",
            "Distributed Shopping Cart (Redis Session Store)",
            "Order Placement & Two-Phase Checkout",
            "Inventory Reservation & Concurrency Locks",
            "Payment Gateway Webhook Handling",
            "Multi-Channel Notification Dispatcher",
            "Customer Reviews & Rating Aggregation",
            "Personalized Recommendation Engine",
            "Order Fulfillment & Shipment Tracking"
        ]
    },
    {
        "title": "Level 56 — Common Real-World Systems",
        "description": "Analyze end-to-end designs for social feeds, video platforms, ride-sharing, food delivery, and chat applications.",
        "icon": "business-outline",
        "topics": [
            "Social Network Architecture (Feed & Graph)",
            "Search Engine Architecture (Crawler & Indexer)",
            "Real-Time Chat & Messaging (WhatsApp/Slack)",
            "Video Streaming Platform (YouTube/Netflix)",
            "Ride Sharing Architecture (Uber/Lyft)",
            "Food Delivery Architecture (DoorDash/Swiggy)",
            "Full E-Commerce Platform Architecture",
            "Cloud File Storage (Dropbox/Google Drive)",
            "Payment Processing & Ledger System (Stripe)",
            "High-Concurrency Ticket Booking (BookMyShow)"
        ]
    },
    {
        "title": "Level 57 — System Design Interview Method",
        "description": "Master the 10-step system design interview framework: requirements, capacity, API, DB schema, high-level, and scaling.",
        "icon": "school-outline",
        "topics": [
            "1. Clarify Requirements & Scope",
            "2. Define Functional Requirements",
            "3. Establish Non-Functional Requirements",
            "4. Back-of-the-Envelope Capacity Estimation",
            "5. REST / gRPC API Design",
            "6. Database Schema & Data Modeling",
            "7. High-Level Architecture Diagram",
            "8. Identify Single Points of Failure & Bottlenecks",
            "9. Deep-Dive & Scale Bottlenecks",
            "10. Trade-Off Evaluation & Justification"
        ]
    },
    {
        "title": "Level 58 — Capacity Estimation",
        "description": "Perform back-of-the-envelope capacity estimates: DAU, QPS/RPS, read-to-write ratios, storage, and bandwidth math.",
        "icon": "calculator-outline",
        "topics": [
            "Users",
            "DAU",
            "Requests/day",
            "Requests/second",
            "Peak requests/second",
            "Storage",
            "Bandwidth",
            "Read/write ratio",
            "Traffic estimation",
            "Storage estimation",
            "Memory estimation"
        ]
    },
    {
        "title": "Level 59 — Trade-Off Thinking",
        "description": "Evaluate architectural choices objectively: SQL vs NoSQL, sync vs async, consistency vs availability, and microservices.",
        "icon": "scale-outline",
        "topics": [
            "SQL vs NoSQL",
            "SQL vs cache",
            "Monolith vs microservices",
            "Sync vs async",
            "Strong vs eventual consistency",
            "Vertical vs horizontal scaling",
            "REST vs gRPC",
            "Single region vs multi-region",
            "Queue vs direct communication"
        ]
    },
    {
        "title": "Level 60 — Architecture Diagrams",
        "description": "Construct end-to-end production architecture diagrams visualizing clients, gateways, load balancers, caches, and databases.",
        "icon": "construct-outline",
        "topics": [
            "Client Tier & User Devices",
            "DNS & Geo-Routing",
            "Content Delivery Network (CDN)",
            "Load Balancers (L4 vs L7)",
            "API Gateway & Reverse Proxy",
            "Web & Application Servers",
            "Distributed In-Memory Cache (Redis)",
            "Primary-Replica Database Clusters",
            "Database Sharding & Partitioning",
            "Message Queues & Event Streaming (Kafka)",
            "Microservices & Service Mesh",
            "Distributed Object Storage (S3)",
            "Search Engine Cluster (Elasticsearch)",
            "Monitoring, Logging & Tracing Infrastructure",
            "End-to-End Scalable Architecture Blueprint"
        ]
    }
],
};
