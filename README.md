# AI Strategic Prioritizer

A decision support tool for AI consultants and business leaders to evaluate organizational AI readiness and prioritize use case portfolios based on feasibility, impact, and risk.

**[🚀 Try the Live Demo](https://huggingface.co/spaces/jorschurer/AI-Use-Case-Prioritizer)**

## The Challenge

Organizations often struggle to prioritize AI initiatives effectively. Business leaders collect dozens of potential use cases but lack a systematic framework to evaluate which projects align with their current capabilities and deliver maximum ROI. Manual scoring is time-consuming, inconsistent, and prone to bias.

## The Solution

This tool provides a structured approach to AI portfolio management:

1. **Assess Organizational Readiness** - Quantify AI maturity across 5 dimensions (Strategy, Data, Technology, Culture, Governance) to establish a capability baseline
2. **Capture Use Cases** - Structure business problems with context, department, resources, and success metrics. Supports manual entry or bulk Excel import for processing dozens of use cases simultaneously
3. **Generate Prioritization Scores** - Leverage LLM analysis to evaluate each use case against feasibility, business impact, and risk factors
4. **Visualize Strategic Fit** - Map use cases onto a priority matrix with automatic classification (Quick Wins, Strategic Bets, Transformational, Low Priority)

The maturity assessment contextualizes the LLM's scoring - a high-impact use case requiring advanced ML capabilities would be categorized differently for an organization with limited technical infrastructure versus one with mature AI operations.

## Technical Architecture

The application is built to ensure reliable LLM integration for business-critical decision support.

**Core Flow:**
1. **Maturity Assessment** → 5-dimension organizational AI readiness evaluation with weighted scoring (Strategy, Data, Technology, Culture, Governance)
2. **Use Case Input** → Structured capture of business context, department, resources, and success metrics
3. **LLM Analysis** → JSON Schema-enforced structured output for feasibility/impact/risk scoring
4. **Visualization** → Interactive priority matrix with quadrant-based classification (Quick Wins, Strategic Bets, Transformational, Low Priority)

**Key Technical Decisions:**
- **Structured Output with JSON Schema:** Unlike free-form LLM responses, JSON Schema enforcement guarantees type-safe, parseable output. Essential for production decision support where inconsistent scoring would undermine trust in recommendations.
- **Client-Side Architecture:** Zero-backend deployment eliminates infrastructure overhead while enabling BYOK security model - users control their API keys and data never touches external servers.
- **Multi-Provider Support:** Abstracted AI service layer allows switching between Google Gemini and OpenAI with identical interfaces, reducing vendor lock-in.

**Stack:**
- React 19 + TypeScript for type safety throughout
- Google Gemini API / OpenAI API with JSON Schema response formatting
- Recharts for data visualization
- Vite for fast development and optimized builds

## Features

1. **5-Dimension Organizational AI Readiness Assessment** - Weighted scoring across Strategy, Data Infrastructure, Technology Capabilities, Organizational Culture, and Governance
2. **Structured Use Case Capture** - Department tagging, resource estimation, timeline planning, and success metrics definition
3. **Excel Bulk Import** - Upload spreadsheets with multiple use cases for instant batch processing (supports .xlsx and .xls formats with columns: Title, Department, Description)
4. **LLM-Powered Feasibility/Impact/Risk Scoring** - Automatic quadrant classification with detailed reasoning (Quick Wins, Strategic Bets, Transformational, Low Priority)
5. **Implementation Guidance** - Actionable recommendations generated based on maturity level and use case characteristics

## Try It

### BYOK (Bring Your Own Key)

This app runs entirely in your browser. Your API key stays local and is never sent to any server.

| Provider | Model | Free Tier |
|----------|-------|-----------|
| **Google Gemini** | gemini-2.0-flash | Yes |
| **OpenAI** | GPT-4o | No |

**Get your free API key:**
- [Google AI Studio](https://aistudio.google.com/app/apikey) (recommended - free tier available)
- [OpenAI Platform](https://platform.openai.com/api-keys)

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Excel Import Format

For bulk use case import, prepare an Excel file (.xlsx or .xls) with these columns (case-insensitive):

| title | department | description |
|-------|-----------|-------------|
| Customer Support Chatbot | Customer Service | Automate tier-1 support inquiries to reduce response time |
| Demand Forecasting | Operations | Predict inventory needs based on historical sales data |
| Lead Scoring | Sales | Prioritize leads using behavioral and demographic signals |

- **title** (required): Brief name for the use case
- **department** (optional): Department/team owning the initiative (defaults to "General")
- **description** (required): Clear explanation of the business problem and desired outcome

Column headers are case-insensitive (e.g., "Title", "title", or "TITLE" all work). The first row must contain column headers. All subsequent rows will be imported as use cases.

## Privacy

- API keys stored in browser localStorage only
- No backend server - all API calls direct from client
- Your data never passes through external servers

## License

MIT
