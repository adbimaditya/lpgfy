# 🔧 Lpgfy

`lpgfy` is a command-line tool designed to automate tasks within the **Subsidi Tepat LPG** section of the [My Pertamina](https://subsiditepatlpg.mypertamina.id/infolpg3kg) website.

## 🗂️ Feature

- **Authentication**
- **Quota Scraping**
- **Order Management**

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (version 14 or higher)
- [npm​](https://www.npmjs.com/)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/adbimaditya/lpgfy.git
   ```

   ```bash
   cd lpgfy
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

## 🛠️ Usage

After installation, you can use the lpgfy command followed by the desired subcommand:

### ​🔐 Authentication

- **Login**: Authenticate with your My Pertamina account.

  ```bash
  npm run dev login
  ```

  Upon execution, you'll be prompted to enter your credentials:​

  - **Identifier**: Input your registered email address or phone number.

    - **Email**: Must be in a valid email format (e.g., user@example.com).

    - **Phone Number**: Should contain 10 to 13 digits without any special characters or spaces.​

  - **PIN**: Enter your 6-digit personal identification number associated with your My Pertamina account.​

- **Logout**: Terminate your current session.

  ```bash
  npm run dev logout
  ```

### 📊 Quota Operations

- **Scrape Quotas**: Extract LPG quota information from a specified file.

  ```bash
  npm run dev -- scrap-quotas --file <path_to_file>
  ```

  **Note**: This command expects a JSON file containing **Nationality IDs**.

### 📝 Order Management

- **Create Orders**: Generate new orders based on the provided file.

  ```bash
  npm run dev -- create-orders --file <path_to_file>
  ```

  **Note**: This command expects a JSON file containing **Orders**.

- **Generate Orders from Quotas**: Create orders directly from the quotas file.

  ```bash
  npm run dev generate-orders
  ```

## 📦 Example Input and Output

### Input

- **Nationality IDs**: An array of strings representing the unique identifiers (e.g., KTP numbers) of customers.​

  ```json
  ["32xxxxxxxxxxxxx0", "32xxxxxxxxxxxxx1"]
  ```

- **Orders**: An array of objects detailing the orders to be processed. Each object contains:​

  ```json
  [
    {
      "nationalityId": "32xxxxxxxxxxxxx0",
      "customerType": "Rumah Tangga",
      "quantity": 1
    }
  ]
  ```

  - `nationalityId`: The customer's unique identifier.​
    Log in or sign up to view
  - `customerType`: The type of customer.​
  - `quantity`: The quantity of LPG requested.

### Output

- **Quotas**: An object representing the allocated LPG quotas for a customer.​

  ```json
  [
    {
      "nationalityId": "32xxxxxxxxxxxxx1",
      "allocations": [
        {
          "customerType": "Usaha Mikro",
          "quantity": 1,
          "isValid:": true
        }
      ]
    }
  ]
  ```

  - `nationalityId`: The customer's unique identifier.​
  - `allocations`: An array detailing the allocations, each containing:​
    - `customerType`: The type of customer.
    - `quantity`: The allocated quantity.
    - `isValid`: Indicates whether the allocation is currently valid, based on factors such as the availability of quota associated with the customer's Kartu Keluarga (KK).

- **Transactions**: An object representing a transaction record.​

  ```json
  [
    {
      "id": "e1axxxxx-3fxx-xx46-bxxx-69edac7xxxxx",
      "order": {
        "nationalityId": "32xxxxxxxxxxxxx2",
        "customerType": "Pengecer",
        "quantity": 1
      },
      "allocation": {
        "customerType": "Pengecer",
        "quantity": 0
      }
    }
  ]
  ```

  - `id`: The unique identifier for the transaction.​
  - `order`: Details of the order placed, including:​
    - `nationalityId`: The customer's unique identifier.
    - `customerType`: The type of customer.
    - `quantity`: The quantity ordered.
  - `allocation`: The remaining quota available for a specific `customerType`.

#### 🧾 Customer Type Values

The `customerType` field accepts the following values:​

- `Rumah Tangga`: Household consumers using LPG 3 kg for domestic purposes.
- `Usaha Mikro`: Micro-businesses utilizing LPG 3 kg for their operations.
- `Pengecer`: Registered retailers authorized to distribute LPG 3 kg.​

Ensure that the `customerType` in your data matches one of these values to maintain data integrity and compliance with subsidy distribution regulations.
