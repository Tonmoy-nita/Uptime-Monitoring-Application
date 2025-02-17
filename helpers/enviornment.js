require('dotenv').config(); // .env ফাইল লোড করার জন্য dotenv ব্যবহার

const environments = {};

environments.staging = {
    port: process.env.PORT1 || 3000, // যদি .env থেকে মান না পাওয়া যায়, তাহলে ডিফল্ট 3000
    envName: process.env.NODE_ENV1 || 'staging',
    secretKey : process.env.SECRET_KEY1 || 'secret',
    maxChecks : process.env.MAX_CHECKS1 || 5,
    twilio :{
        fromPhone : process.env.FROM_PHONE,
        accountSid : process.env.ACCOUNTSID,
        authToken : process.env.AUTHTOKEN
    }
};

environments.production = {
    port: process.env.PORT2 || 5000, // যদি .env থেকে মান না পাওয়া যায়, তাহলে ডিফল্ট 5000
    envName: process.env.NODE_ENV2 || 'production',
    secretKey : process.env.SECRET_KEY2 || 'secret',
    maxChecks : process.env.MAX_CHECKS1 || 5,
    twilio :{
        fromPhone : process.env.FROM_PHONE,
        accountSid : process.env.ACCOUNTSID,
        authToken : process.env.AUTHTOKEN
    }
};

// determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport =
    typeof environments[currentEnvironment] === 'object' //আমরা চেক করছি যে environments[currentEnvironment] আসলেই একটি অবজেক্ট কি না।
        ? environments[currentEnvironment] //যদি হ্যাঁ, তাহলে সেই পরিবেশের কনফিগারেশন পাঠানো হবে।
        : environments.staging; //যদি না, তাহলে ডিফল্টভাবে "staging" পাঠানো হবে।

//export module
module.exports = environmentToExport;
