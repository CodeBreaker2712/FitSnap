import { withAuthenticator } from '@aws-amplify/ui-react';

function Auth() {
  return (
    <div>
      <h1>Welcome to My App</h1>
    </div>
  );
}

export default withAuthenticator(Auth);