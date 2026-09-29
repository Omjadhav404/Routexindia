import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';

// Initialize Groq client if API key is present
const groq = apiKey ? new Groq({ apiKey }) : null;

// Realistic fallback generator when Groq is not configured
function generateMockResponse(prompt: string, contextType: string) {
  const normalized = prompt.toLowerCase();
  
  if (contextType === 'route' || normalized.includes('route') || normalized.includes('optimize') || normalized.includes('path')) {
    return `### RouteXIndia.AI Pathing Optimization Engine

**Primary Optimized Path**: Mumbai (NH-48) → Pune (NH-4) → Bangalore
* **Total Distance**: 985 km (optimized from 1,020 km)
* **Estimated ETA**: 17 hrs 45 mins (saved 1.5 hrs via bypass routes)
* **Fuel Cost Estimate**: ₹14,250 (calculated at ₹95/L for 150L diesel)
* **AI Efficiency Score**: 96/100

**Risk Analysis**:
1. **Weather**: Medium monsoon rainfall in Western Ghats. Speed limit reduced to 60 km/h in Lonavala bypass.
2. **Infrastructure**: Toll booths active on NH-48; pre-paid Fastag is verified.
3. **Dispatch Recommendation**: RouteMH-12-Q-4029 cleared for immediate departure with 85% load capacity limit due to wet asphalt conditions.`;
  }
  
  if (contextType === 'fuel' || contextType === 'cost' || normalized.includes('fuel') || normalized.includes('cost') || normalized.includes('budget') || normalized.includes('expense')) {
    return `### Cost & Fuel Consumption Optimization Model

* **Sector**: Delhi Hub to Mumbai Expressway Corridor (NH-48)
* **Standard Expense**: ₹24,800 INR
* **AI Optimized Expense**: ₹20,724 INR (Net Savings: **₹4,076** | **16.4%**)
* **Consumption Forecast**: 220 Liters (6.45 km/L under AI cruise assist)
* **Cost Mitigation Items**:
  - Restrict speed to **72 km/h** on Rajasthan segment (saves 8.2% drag).
  - Stop at Jaipur Bypass HP Pump (lowest diesel pricing zone).
  - Pre-pay state entry taxes to bypass checkpoint gridlock queues.`;
  }

  if (contextType === 'eta' || normalized.includes('eta') || normalized.includes('arrive') || normalized.includes('time')) {
    return `### Delivery ETA Prediction Model

* **Shipment Waybill**: #RTX-PKG-209 (Urgent Priority)
* **Origin-Destination**: Bangalore → Chennai
* **Nominal Transit Time**: 6 hrs 15 mins (340 km)
* **Gridlock Telemetry Alert**: +35 mins delay detected near Sriperumbudur Toll segment.
* **AI Adjusted ETA**: 6 hrs 50 mins
* **Confidence Level**: 94% (based on real-time speeds of preceding vehicles)
* **Alternative Option**: Rerouting via Kanchipuram bypass avoids toll backup and drops transit to 6 hrs 22 mins. Recommended.`;
  }

  if (contextType === 'demand' || normalized.includes('demand') || normalized.includes('forecast') || normalized.includes('trend')) {
    return `### AI Demand Forecasting Analytics

* **Analysis Period**: Q3 (Monsoon-Post Monsoon transition)
* **Region**: Western Sector Hubs (Mumbai, Pune, Surat)
* **Cargo Demand Projection**:
  - Manufacturing/Steel shipments: ↑ **12.4%** (B2B restock cycles).
  - FMCG/Retail: ↑ **18.2%** (pre-festive inventory build).
  - Heavy Container loads: ↓ **5%** (monsoon roadway constraints).

**Actionable Recommendations**:
- Pre-stage **15 additional heavy containers** at Surat Hub by week 2 to capture refinery outflows.
- Transition 10% of local distribution load to Light Delivery Vans to maintain agility in metropolitan rains.`;
  }

  if (contextType === 'fleet' || normalized.includes('fleet') || normalized.includes('utilization') || normalized.includes('vehicle')) {
    return `### Fleet Utilization & Load Matching Analysis

* **Active Fleet Count**: 42 Vehicles (West Sector)
* **Average Utilization**: **84.2%** (Target: 88%)
* **Imbalances Identified**:
  - **Surplus**: Light Delivery Vans in Delhi Hub (35% idle).
  - **Deficit**: Heavy haulage container trucks in Pune Hub (100% active, 8 queued bookings).
  
**Mitigation Strategy**:
1. Route 3 empty return trucks from Ahmedabad via Pune to absorb heavy B2B cargo backlogs.
2. Re-assign stand-by drivers (DRV-054) to active heavy cargo operations.
3. Optimize vehicle maintenance intervals to ensure active downtime does not exceed 3% during peak shipping weeks.`;
  }

  if (contextType === 'compliance' || contextType === 'gst' || normalized.includes('gst') || normalized.includes('tax') || normalized.includes('invoice') || normalized.includes('eway')) {
    return `### GST Compliance & Tax Optimization Audit

* **Subject**: Inter-state dispatch (Jharkhand to Maharashtra)
* **Tax Bracket Identification**: Steel parts under HSN Code **7208** are subject to **18% GST** (Split: 9% CGST + 9% SGST if intra-state, or 18% IGST if inter-state).
* **Compliance Checks**:
  1. **E-Way Bill Status**: Verified. Consigned under E-way Bill **884901284719** linking vehicle MH-12-Q-4029.
  2. **E-Invoice IRN**: Generated successfully. IRN: \`72B40AC49281...0A1Z5\`.
  3. **GSTIN Check**: tata steel limited (consignor) is verified active.
  
**AI Tax Advisory**: Ensure E-way bill distance calculations are matching the optimized route parameters (985 km). Discrepancies exceeding 10% between physical route distance and E-way bill logs can trigger compliance audits at state borders.`;
  }

  // General chat chatbot
  return `Hello, this is the **RouteXIndia.AI Logistics Copilot**. 

I am running in demonstration mode. Here is a summary of real-time diagnostics I can assist you with:
1. **Route Optimization**: e.g., "Optimize route from Bangalore to Chennai"
2. **Fuel & Cost Optimization**: e.g., "Analyze cost reduction items for sector Surat to Pune"
3. **ETA Predictions**: e.g., "Predict ETA for waybill #RTX-PKG-209"
4. **Demand Forecasting**: e.g., "Forecast B2B cargo demand in Q3"
5. **Fleet Utilization**: e.g., "Analyze vehicle utilization in West Hub"
6. **GST & Compliance**: e.g., "GST tax bracket advisory for HSN 7208"

Feel free to ask any operational question!`;
}

export async function POST(request: Request) {
  try {
    const { prompt, contextType = 'general' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // If Groq is not configured, return mock response
    if (!groq) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockReply = generateMockResponse(prompt, contextType);
      return NextResponse.json({ text: mockReply, isMock: true });
    }

    // If Groq is configured, run the model
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are the chief AI Logistics Architect for RouteXIndia.AI, an advanced B2B freight, dispatch, and fleet management platform operating on the Indian National Highways grid. 
          Use clear markdown structure in your response. 
          Format numerical metrics using bold text. 
          Provide detailed suggestions referencing actual Indian corridors (e.g. NH-48, NH-4, Western Expressway, Fastag lanes, logistics hubs in Mumbai, Bangalore, Pune, Delhi-NCR, Chennai, Kolkata). 
          Offer professional insights on fuel efficiency, toll stops, weather advisories (monsoon, heatwaves), and driver safety recommendations.
          Support context queries on:
          1. Route Optimization (pathing, speed, bypasses)
          2. ETA Predictions (traffic delays, Fastag backups)
          3. Cost Optimization (fuel savings, speed limits)
          4. Demand Forecasting (seasonal logistics, restock cycles)
          5. Fleet Utilization Analysis (idle times, capacity classes)
          6. GST Compliance Insights (HSN codes, E-way bill distances, tax splitting)`,
        },
        {
          role: 'user',
          content: `[Context: ${contextType}] User Inquiry: ${prompt}`,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 800,
    });

    const responseText = chatCompletion.choices[0]?.message?.content || 'No response generated.';
    return NextResponse.json({ text: responseText, isMock: false });
  } catch (error: any) {
    console.error('Groq AI API Error:', error);
    return NextResponse.json(
      { error: 'Failed to communicate with AI model. Running fallback diagnostics.', details: error.message },
      { status: 500 }
    );
  }
}
