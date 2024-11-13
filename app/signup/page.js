import Signup from "@/components/Signup";
import React from "react";
import { Suspense } from 'react'; 

const SignupPage = () => {
  <Suspense fallback={<div>Loading...</div>}>
  return <Signup />;
  </Suspense>
};

export default SignupPage;