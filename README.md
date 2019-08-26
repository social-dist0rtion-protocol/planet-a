# deora.earth - 

deora.earth is a universal white-label voting and community platform. 

We 

The game will begin as a gimmick incentivizing participants through a financial incentive to interact with each other via a burner wallet. Half way through the game, players will find themselves in a tragedy of the commons, as they find out that their greedy interactions had dangerous emissions that now threaten to collapse the economy of Berlin Blockchain Week. They enter as teams into a competition to educate each other, and prevent an economic tipping points to be reached. The team that manages to achieve the best climate score wins the event.

## Installation

The Planet A Wallet runs on LeapDAO's test network. Installation should be
simple and straight forward:

```bash
$ git clone https://github.com/social-dist0rtion-protocol/planet-a.git
$ npm i
$ npm run start
```

If you're experiencing issues in relation to HTTP, you can start the burner on
HTTPS by running:

```bash
$ HTTPS=true npm run start
```

## Components

### ERC20 Tokens


### ERC1948 Tokens


```
+------------+------------+------------+-------------+
| 20 bytes   | 4 bytes    | 4 bytes    | 4 bytes     |
| name str   | picId      | CO₂ locked | CO₂ emitted |
+------------+------------+------------+-------------+
```


### Smart Contracts
The [planet-a-contracts](https://github.com/social-dist0rtion-protocol/planet-a-contracts) repository contains:
- `Earth`: smart contract that handles the handshake function and releases CO₂ to `Air`, and Göllars to the players.
- `Air`: smart contact that accumulates CO₂. It exposes the `plantTree` function to lock CO₂ back to `Earth`.


## License

MIT
