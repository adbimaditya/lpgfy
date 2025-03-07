export function encodeCustomerType(customerType: string) {
  return customerType.replace(' ', '+');
}
