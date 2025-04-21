const express = require('express');
const { envoyMiddleware, errorMiddleware, asyncHandler } = require('@envoy/envoy-integrations-sdk');
const app = express();
const PORT = process.env.PORT || 3000;

// Use the middleware with the correct name
app.use(envoyMiddleware());

// Add basic health check route
app.get('/', (req, res) => {
  res.send('Envoy plugin is running');
});

app.post('/hello-options', (req, res) => {
  res.send([
    {
      label: 'Hello',
      value: 'Hello',
    },
    {
      label: 'Hola',
      value: 'Hola',
    },
    {
      label: 'Aloha',
      value: 'Aloha',
    },
  ]);
});

app.post('/goodbye-options', (req, res) => {
  res.send([
    {
      label: 'Goodbye',
      value: 'Goodbye',
    },
    {
      label: 'Adios',
      value: 'Adios',
    },
    {
      label: 'Aloha',
      value: 'Aloha',
    },
  ]);
});

app.post('/visitor-sign-in', asyncHandler(async (req, res) => {
  try {
    const envoy = req.envoy; // our middleware adds an "envoy" object to req.
    
    if (!envoy) {
      console.error('Envoy object not found in request');
      return res.status(500).send({ error: 'Envoy object not found in request' });
    }
    
    const job = envoy.job;
    const hello = envoy.meta.config.HELLO || 'Hello'; // Default to 'Hello' if not set
    const visitor = envoy.payload;
    
    if (!visitor || !visitor.attributes || !visitor.attributes['full-name']) {
      console.error('Visitor or visitor name not found in payload');
      return res.status(400).send({ error: 'Visitor information is incomplete' });
    }
    
    const visitorName = visitor.attributes['full-name'];
    const message = `${hello} ${visitorName}!`;
    
    await job.attach({ label: 'Hello', value: message });
    res.send({ hello });
  } catch (error) {
    console.error('Error in visitor-sign-in:', error);
    res.status(500).send({ error: 'Internal server error', details: error.message });
  }
}));

app.post('/visitor-sign-out', asyncHandler(async (req, res) => {
  try {
    const envoy = req.envoy;
    
    if (!envoy) {
      console.error('Envoy object not found in request');
      return res.status(500).send({ error: 'Envoy object not found in request' });
    }
    
    const job = envoy.job;
    const goodbye = envoy.meta.config.GOODBYE || 'Goodbye'; // Default to 'Goodbye' if not set
    const visitor = envoy.payload;
    
    if (!visitor || !visitor.attributes || !visitor.attributes['full-name']) {
      console.error('Visitor or visitor name not found in payload');
      return res.status(400).send({ error: 'Visitor information is incomplete' });
    }
    
    const visitorName = visitor.attributes['full-name'];
    const message = `${goodbye} ${visitorName}!`;
    
    await job.attach({ label: 'Goodbye', value: message });
    res.send({ goodbye });
  } catch (error) {
    console.error('Error in visitor-sign-out:', error);
    res.status(500).send({ error: 'Internal server error', details: error.message });
  }
}));

// Add error middleware last
app.use(errorMiddleware());

// Listen on the port provided by Heroku
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
