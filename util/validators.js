const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) {
    return true;
  } else return false;
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

exports.validateSignupData = data => {
  let errors = {};
  if (isEmpty(data.firstName)) errors.firstName = "Must not be empty";
  if (isEmpty(data.lastName)) errors.lastName = "Must not be empty";
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  else if (!isEmail(data.email))
    errors.email =
      "Must be valid email address";

  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (data.password.length < 6) errors.password = "Must be atleast 6 characters long";


  if(data.firstName.length < 2) errors.firstName = "Must be atleast 2 characters long";
  if(data.lastName.length < 2) errors.lastName = "Must be atleast 2 characters long";


  const userNamePattern = /^[0-9a-zA-Z]+$/;
  if(!data.userName.match(userNamePattern)) {
    errors.userName = "Must contain only letters or numbers";    
  }
  
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};
  let email = false;
  if (isEmpty(data.userName)) errors.userName = "Must not be empty";
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if(data.userName.includes("@")){
    if(isEmail(data.userName)) {
      email = true;
    } else {
      errors.userName = "Must be valid email or username";
    }
  }
  else {
    const userNamePattern = /^[0-9a-zA-Z]+$/;
    if(!data.userName.match(userNamePattern)) {
      errors.userName = "Must contain letters or numbers";    
    }
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
    email
  };
};


exports.validateOTPData = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (isEmpty(data.otp)) errors.otp = "Must not be empty";
  else if(!isEmail(data.email)) errors.email = "Must be valid email address";
  if(data.otp.length !== 4) 
    errors.otp = "Must be of 4 characters long";
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
}

exports.validateEmail = data => {
  let errors = {};
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  else if(!isEmail(data.email)) errors.email = "Must be valid email address";
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
}