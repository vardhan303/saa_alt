// Function to simulate our updated verifyJwt function without modifying the actual code
function testVerifyJwt(payload) {
  // This simulates our updated verifyJwt implementation
  if (!payload) return null;
  
  // Add id property if it doesn't exist, for consistent API
  if (!payload.id) {
    payload.id = payload.sub || payload.googleId || payload._id;
  }
  
  return payload;
}

// Run tests for our verifyJwt function
function runTests() {
  console.log('Testing verifyJwt with different token formats:');
  
  console.log('\nTesting token with "sub" field:');
  const decoded1 = testVerifyJwt({ sub: 'user123', name: 'John Doe' });
  console.log('Original payload:', { sub: 'user123', name: 'John Doe' });
  console.log('Decoded with id:', decoded1);
  
  console.log('\nTesting token with "googleId" field:');
  const decoded2 = testVerifyJwt({ googleId: 'user123', name: 'Jane Doe' });
  console.log('Original payload:', { googleId: 'user123', name: 'Jane Doe' });
  console.log('Decoded with id:', decoded2);
  
  console.log('\nTesting token with "id" field:');
  const decoded3 = testVerifyJwt({ id: 'user123', name: 'Jack Doe' });
  console.log('Original payload:', { id: 'user123', name: 'Jack Doe' });
  console.log('Decoded with id:', decoded3);
  
  console.log('\nTesting token with "_id" field:');
  const decoded4 = testVerifyJwt({ _id: 'user123', name: 'Jill Doe' });
  console.log('Original payload:', { _id: 'user123', name: 'Jill Doe' });
  console.log('Decoded with id:', decoded4);
  
  console.log('\nTesting token without any id field:');
  const decoded5 = testVerifyJwt({ name: 'Jim Doe' });
  console.log('Original payload:', { name: 'Jim Doe' });
  console.log('Decoded with id:', decoded5);
}

// Run the tests
runTests();