# EtherRealnodesDapp

Welcome to EtherRealnodesDapp, a decentralized application (DApp) featuring smart contracts for managing RealToken (an ERC-20 token) and EtherNodes. Users can purchase different classes of nodes using Real tokens, claim additional Real tokens hourly based on node type, transfer node ownership to other users, and deactivate nodes at any time to receive a percentage of their cost price instantly.

## Setup

### Clone Repository

```bash
git clone https://github.com/kennisnutz/EtherealDapp.git
```

### Navigate to Project Directory

```bash
cd EtherRealnodesDapp/contract
```

### Install Dependencies

```bash
npm install
```

or

```bash
yarn
```

### Configure Environment Secrets

Create a `secret.ts` file by copying the contents of `.secret.ts.sample`:

```bash
cp .secret.ts.sample .secret.ts
```

Update the private keys and other parameters in the `secret.ts` file to match your setup.

## Smart Contracts

- The `contracts/` directory contains smart contracts for the RealToken (ERC-20 token) and EtherNodes.
- Modify or add contracts in the `contracts/` directory.
- Libraries or dependencies can be added to the `contracts/` directory.

## Testing

- Use the `test/` directory to write tests for smart contracts.
- Add test cases for each contract or functionality to be tested.

## Deployment

1. **Compile Contracts:**

   ```bash
   npx hardhat compile
   ```

2. **Run Tests:**

   ```bash
   npx hardhat test
   ```

3. **Deploy Contracts:**

   ```bash
   npx hardhat run scripts/deploy.ts
   ```

   Don't forget to save the output logs.

## Usage

- Follow the deployment steps to set up the development environment and deploy the contracts.
- Interact with the deployed contracts using the respective contract addresses.

## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as needed.
