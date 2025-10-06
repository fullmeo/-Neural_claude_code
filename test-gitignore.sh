#!/bin/bash

# 🔒 Test script pour vérifier .gitignore

echo "🔍 Testing .gitignore rules..."
echo ""

# Test 1: .env should be ignored
if git check-ignore .env > /dev/null 2>&1; then
    echo "✅ .env is ignored"
else
    echo "❌ DANGER: .env is NOT ignored!"
    exit 1
fi

# Test 2: .env.local should be ignored
if git check-ignore .env.local > /dev/null 2>&1; then
    echo "✅ .env.local is ignored"
else
    echo "❌ DANGER: .env.local is NOT ignored!"
    exit 1
fi

# Test 3: .env.example should NOT be ignored
if git check-ignore .env.example > /dev/null 2>&1; then
    echo "❌ PROBLEM: .env.example is ignored (should be tracked)"
    exit 1
else
    echo "✅ .env.example is tracked (good)"
fi

# Test 4: contracts/.env should be ignored
if git check-ignore contracts/.env > /dev/null 2>&1; then
    echo "✅ contracts/.env is ignored"
else
    echo "❌ DANGER: contracts/.env is NOT ignored!"
    exit 1
fi

# Test 5: contracts/.env.example should NOT be ignored
if git check-ignore contracts/.env.example > /dev/null 2>&1; then
    echo "❌ PROBLEM: contracts/.env.example is ignored"
    exit 1
else
    echo "✅ contracts/.env.example is tracked (good)"
fi

echo ""
echo "🎉 All .gitignore tests passed!"
echo ""
echo "✅ .env files are protected"
echo "✅ .env.example files are tracked"
echo "✅ No secrets will be committed"

