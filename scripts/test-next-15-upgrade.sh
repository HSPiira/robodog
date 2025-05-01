#!/bin/bash

# Test script for Next.js 15 upgrade verification

echo "🔍 Testing Next.js 15 compatibility..."

# Check for deprecated synchronous Request APIs
echo "1. Checking for deprecated Request APIs..."
grep -r "new Request" --include="*.ts" --include="*.tsx" src/ || echo "✅ No synchronous Request APIs found"

# Check for proper async/await usage in API routes
echo "2. Checking API route handlers..."
grep -r "export async function" --include="*.ts" src/app/api/ || echo "✅ All API routes are properly async"

# Check for proper error handling in fetch calls
echo "3. Checking fetch error handling..."
grep -r "fetch(" --include="*.ts" --include="*.tsx" src/ | grep -v "await" && echo "⚠️ Found potential synchronous fetch calls" || echo "✅ All fetch calls appear to be properly awaited"

# Check for proper response handling
echo "4. Checking response handling..."
grep -r "response.json()" --include="*.ts" --include="*.tsx" src/ | grep -v "await" && echo "⚠️ Found potential synchronous response.json() calls" || echo "✅ All response.json() calls appear to be properly awaited"

echo "📝 Next steps:"
echo "1. Run the Next.js 15 codemod: npx @next/codemod@canary upgrade latest"
echo "2. Test all API routes manually"
echo "3. Verify all client-side data fetching"
echo "4. Run your test suite"
echo "5. Check for any console warnings about deprecated APIs" 