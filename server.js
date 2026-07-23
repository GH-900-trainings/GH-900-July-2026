import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createAzureMapsService } from './src/services/azureMapsService.js';
import { createWeatherController } from './src/controllers/weatherController.js';
import { COUNTRY_GROUPS } from './src/data/countries.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables from a local `.env` file when present. The file
// is git-ignored so secrets such as the Azure Maps key stay out of source
// control. `loadEnvFile` throws if the file is missing, which is fine in
// environments that inject env vars directly (CI, container platforms, ...).
try {
  process.loadEnvFile();
} catch {
  // No .env file - rely on the ambient environment.
}

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.static(join(__dirname, 'public')));

// Supported cities grouped into country buckets, each with a national flag
// emoji. Static data, so this endpoint is always available.
app.get('/api/cities', (req, res) => {
  res.json({ countries: COUNTRY_GROUPS });
});

// Weather & time API. Requires AZURE_MAPS_KEY to be configured.
const azureMapsKey = process.env.AZURE_MAPS_KEY;
if (azureMapsKey) {
  const azureMaps = createAzureMapsService({ subscriptionKey: azureMapsKey });
  app.get('/api/weather', createWeatherController({ azureMaps }));
} else {
  app.get('/api/weather', (req, res) => {
    res.status(503).json({
      error:
        'Weather service is not configured. Set AZURE_MAPS_KEY in your .env file.',
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
