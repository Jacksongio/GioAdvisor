# GioAdvisor Backend Setup Guide

## 🚀 Complete Backend Implementation

Your GioAdvisor platform now has a fully functional backend with:
- **21 major countries** with comprehensive geopolitical data
- **8 conflict types** with detailed parameters
- **OpenAI API integration** for strategic recommendations
- **RESTful API endpoints** for all data and simulations

## 📁 Backend Structure

```
GioAdvisor/
├── data/
│   ├── countries.json          # Comprehensive country database
│   └── conflicts.json          # Conflict types and parameters
├── app/api/
│   ├── countries/
│   │   ├── route.ts            # GET all countries
│   │   └── [code]/route.ts     # GET specific country
│   ├── conflicts/
│   │   └── route.ts            # GET all conflict types
│   └── simulate/
│       └── route.ts            # POST simulation with AI
├── lib/
│   └── openai.ts               # OpenAI service integration
└── env.template                # Environment variables template
```

## 🔧 Setup Instructions

### 1. Install Dependencies

First, install the OpenAI package:
```bash
npm install openai@^4.67.3
```

### 2. Environment Configuration

1. Copy the environment template:
```bash
cp env.template .env.local
```

2. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)

3. Edit `.env.local` and add your API key:
```env
OPENAI_API_KEY=your_actual_openai_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Fix Dependency Issues

Since you had the `date-fns` version conflict, run:
```bash
npm install date-fns@^3.6.0
```

### 4. Start the Application

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

## 🌍 Country Database

The backend includes detailed data for 21 major countries:

### North America
- 🇺🇸 United States (Power: 95)
- 🇨🇦 Canada (Power: 63)
- 🇲🇽 Mexico (Power: 43)

### Europe
- 🇬🇧 United Kingdom (Power: 80)
- 🇫🇷 France (Power: 78)
- 🇩🇪 Germany (Power: 76)
- 🇮🇹 Italy (Power: 55)
- 🇪🇸 Spain (Power: 52)
- 🇹🇷 Turkey (Power: 50)

### Asia
- 🇨🇳 China (Power: 90)
- 🇯🇵 Japan (Power: 74)
- 🇮🇳 India (Power: 72)
- 🇰🇷 South Korea (Power: 58)
- 🇸🇦 Saudi Arabia (Power: 48)
- 🇮🇱 Israel (Power: 47)
- 🇮🇷 Iran (Power: 46)
- 🇵🇰 Pakistan (Power: 44)

### Others
- 🇷🇺 Russia (Power: 85)
- 🇧🇷 Brazil (Power: 65)
- 🇦🇺 Australia (Power: 60)
- 🇪🇬 Egypt (Power: 45)

### Country Data Includes:
- **Demographics**: Population, GDP, GDP per capita
- **Military**: Budget, nuclear weapons, cyber capabilities
- **Politics**: Government type, stability ratings
- **Diplomacy**: Influence, allies, rivals, trade dependencies
- **Resources**: Strategic resources, major exports
- **Conflicts**: Territorial disputes, currency

## ⚔️ Conflict Types

8 comprehensive conflict scenarios:

1. **🗺️ Territorial Dispute** - Border and sovereignty conflicts
2. **💼 Trade War** - Economic conflicts and sanctions
3. **💻 Cyber Attack** - Digital warfare and infrastructure
4. **☢️ Nuclear Threat** - Nuclear weapons and proliferation
5. **🏥 Humanitarian Crisis** - Refugee and aid crises
6. **⛽ Resource Conflict** - Oil, water, mineral disputes
7. **🎭 Proxy War** - Indirect conflicts through allies
8. **🚫 Economic Sanctions** - Financial and trade penalties

## 🤖 AI Integration Features

### OpenAI-Powered Analysis
- **Strategic Recommendations**: 5-7 actionable strategies
- **Risk Assessment**: Multi-factor risk calculations
- **Diplomatic Analysis**: Success probability scoring
- **Economic Impact**: Trade and financial projections
- **Military Readiness**: Defense capability analysis

### Fallback System
If OpenAI is unavailable, the system provides:
- Algorithm-based analysis using country data
- Realistic scoring based on geopolitical factors
- Generic but relevant recommendations

## 📊 API Endpoints

### Countries
```http
GET /api/countries
# Returns all countries with basic info

GET /api/countries/[code]
# Returns detailed country data with relationships
```

### Conflicts
```http
GET /api/conflicts
# Returns all conflict types with parameters
```

### Simulation
```http
POST /api/simulate
Content-Type: application/json

{
  "selectedCountry": "US",
  "conflictScenario": "territorial",
  "offensiveCountry": "CN", 
  "defensiveCountry": "TW",
  "economicFactors": { ... },
  "militaryFactors": { ... },
  "diplomaticFactors": { ... }
}
```

## 🔒 Security & Performance

### Environment Variables
- All sensitive data in `.env.local`
- OpenAI API key properly secured
- No hardcoded secrets in code

### Error Handling
- Graceful API failures
- Fallback analysis system
- User-friendly error messages

### Caching (Future Enhancement)
- Consider Redis for country data caching
- OpenAI response caching to reduce costs
- Database migration for production scaling

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Recommended Deployment
- **Vercel** (easiest for Next.js)
- **Environment variables** set in deployment platform
- **Database migration** for production scale

## 💡 Usage Examples

### Basic Simulation
1. Select your country (e.g., United States)
2. Choose conflict type (e.g., Trade War)
3. Set offensive country (e.g., China)
4. Set defensive country (e.g., Taiwan)
5. Run simulation for AI-powered analysis

### Advanced Features
- View detailed country relationships
- Analyze economic dependencies
- Assess military capabilities
- Review historical territorial disputes

## 🐛 Troubleshooting

### Common Issues

**OpenAI API Key Issues:**
```bash
# Check your API key is set correctly
echo $OPENAI_API_KEY
```

**Dependency Conflicts:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Data Loading Issues:**
- Check that `data/countries.json` and `data/conflicts.json` exist
- Verify API endpoints are accessible at `/api/countries` and `/api/conflicts`

### Development Tips
- Use browser DevTools to monitor API calls
- Check Network tab for failed requests
- Console logs available for debugging
- Fallback system ensures app always works

## 🎯 Next Steps

### Potential Enhancements
1. **Database Integration**: PostgreSQL for production
2. **User Authentication**: Save simulation history
3. **Real-time Data**: Live geopolitical updates
4. **Advanced AI**: GPT-4 Turbo for deeper analysis
5. **Visualization**: Interactive maps and charts
6. **Multi-language**: Support for other languages

Your GioAdvisor platform is now a sophisticated political simulation tool with real geopolitical data and AI-powered insights! 🌍✨ 