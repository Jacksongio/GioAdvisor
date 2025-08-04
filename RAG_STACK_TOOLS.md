# RAG Stack Tooling Choices for GioAdvisor Treaty Research

## 1. LLM: OpenAI GPT-4
**Choice**: OpenAI GPT-4 for text generation, query analysis, and utilization guidance.
**Rationale**: GPT-4 provides superior reasoning capabilities essential for complex geopolitical analysis and can generate nuanced treaty utilization guidance specific to conflict scenarios.

## 2. Embedding Model: OpenAI text-embedding-ada-002
**Choice**: OpenAI's text-embedding-ada-002 for semantic search and document retrieval.
**Rationale**: This model excels at capturing semantic relationships in legal and diplomatic text, enabling accurate retrieval of relevant treaties based on conflict context rather than just keyword matching.

## 3. Orchestration: Next.js API Routes with Custom Logic
**Choice**: Custom Next.js API routes handling RAG workflow orchestration.
**Rationale**: Next.js provides seamless full-stack integration allowing us to build specialized orchestration logic for treaty analysis, country participation detection, and scenario-based query generation without external dependencies.

## 4. Vector Database: In-Memory Vector Store with Cosine Similarity
**Choice**: Custom in-memory vector storage using cosine similarity for semantic search.
**Rationale**: For our focused treaty dataset (~260 documents), in-memory storage provides optimal performance and simplicity while maintaining sub-second response times for diplomatic decision-making scenarios.

## 5. Monitoring: Console Logging with Error Handling
**Choice**: Built-in Node.js console logging with comprehensive error handling and user feedback.
**Rationale**: Simple logging provides sufficient visibility for development and debugging while toast notifications ensure users receive immediate feedback on system status and errors.

## 6. Evaluation: RAGAS Framework Implementation
**Choice**: RAGAS (Retrieval Augmented Generation Assessment) for measuring faithfulness, context precision, context recall, and answer relevance.
**Rationale**: RAGAS provides standardized metrics specifically designed for RAG systems, enabling objective measurement of treaty retrieval accuracy and response quality in diplomatic contexts.

## 7. User Interface: Next.js with React and Tailwind CSS
**Choice**: Next.js frontend with React components styled using Tailwind CSS and shadcn/ui components.
**Rationale**: Next.js enables server-side rendering for fast load times critical in crisis situations, while Tailwind provides rapid styling for a professional diplomatic interface with consistent design patterns.

## 8. Serving & Inference: Next.js API Routes with OpenAI API Integration
**Choice**: Next.js API routes serving as middleware between frontend and OpenAI services.
**Rationale**: Next.js API routes provide serverless-ready deployment with automatic scaling while maintaining secure API key management and request rate limiting essential for production diplomatic tools.

## Additional Implementation Notes

### Data Processing Pipeline
- **Text Chunking**: Custom chunking strategy preserving treaty structure and metadata
- **Metadata Extraction**: Automated parsing of treaty types, years, parties, and sections
- **Country Participation Analysis**: Heuristic-based detection of signatory status

### Performance Optimizations
- **Batch Processing**: Treaties processed in batches to manage API rate limits
- **Caching**: In-memory caching of embeddings and statistics for rapid retrieval
- **Lazy Loading**: Treaties loaded only when complete scenario context is available

### Security Considerations
- **API Key Management**: Secure server-side OpenAI API key handling
- **Input Validation**: Comprehensive validation of user inputs and scenario parameters
- **Error Boundaries**: Graceful error handling preventing system crashes during critical analysis