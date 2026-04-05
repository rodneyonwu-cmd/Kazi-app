FROM node:24-alpine

WORKDIR /app

# Install only production deps — skip vite/frontend build
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy app source
COPY . .

# Generate Prisma client if schema exists
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

EXPOSE 3001

CMD ["node", "server/index.js"]
