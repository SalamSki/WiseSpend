const otpAsciiCharsSingleton = () => {
  return [
    ...[...Array(26).keys()].map((idx) => idx + 65),
    ...[...Array(10).keys()].map((idx) => idx + 48),
  ];
};
type OtpAsciiCharsSingleton = ReturnType<typeof otpAsciiCharsSingleton>;
const globalForOtpAsciiChars = globalThis as unknown as {
  otpAsciiChars: OtpAsciiCharsSingleton | undefined;
};
const otpAsciiChars =
  globalForOtpAsciiChars.otpAsciiChars ?? otpAsciiCharsSingleton();
export default otpAsciiChars;
if (process.env.NODE_ENV !== "production")
  globalForOtpAsciiChars.otpAsciiChars = otpAsciiChars;

export function dateToString(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDay()).padStart(2, "0")}`;
}

export const startDate = new Date("2000-01-01");
export const today = new Date();
export const todayString = dateToString(new Date());

export const inital_res = {
  success: false,
  msg: "",
};


export const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const montOrderShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
export const verificationEmailHTML = (username: string, otp: string) => `
<div style='
      background-color: #121212;
      font-family: "Open Sans", sans-serif;
      font-size: large;
      overflow: hidden;
      color: white;
      '>

    <div style='
      text-align: center;
      margin: 100px auto;
      padding: 0 25px;
      '>
      <h1 style='color: white;'>Hello ${username}</h1>
      <h5 style='color: white;'>Welcome To WiseSpend.</h5>
      <h5 style='color: white;'>Here is your verification code:</h5>

      <div style='
      border-radius: 2px;
      background-color: #292929;
      width: fit-content;
      letter-spacing: 20px;
      padding: 5px 20px;
      margin: 10px auto;
      '>
        <h1 style='margin: 0 auto; color: white;'>${otp}</h1>
      </div>
    </div>
  </div>`;

export const resetEmailHTML = (username: string, url: string) => `
<div style='
      background-color: #121212;
      font-family: "Open Sans", sans-serif;
      font-size: large;
      overflow: hidden;
      color: white;
      '>
  <div style='
      text-align: center;
      margin: 100px auto;
      padding: 0 25px;
      '>
    <h1 style='color: white;'>Hello ${username}</h1>
    <h5 style='color: white;'>Forgot your password?</h5>
    <h5 style='color: white;'>Here is your password reset link:</h5>
    
    <a href='${url}'>Reset here</a>
    
    <h5 style='color: white;'>Or copy it:</h5>
    
    <a href='${url}'>${url}</a>
    
    </div>
</div>`;
