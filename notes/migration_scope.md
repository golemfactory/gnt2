Updated Requirements for GNT v2
===============================

The new GNT token must implement ERC-20, preferably by implementing an open-sourced interface from OpenZeppelin. We want to limit the share of hand-crafted code as much as possible.

We'd like to explore two main approaches:
1. modular - the new GNT contract is purely ERC-20 (plus kill switch feature described below) and any additional features are implemented using sister contracts that supplement the main one (similar to how currently GNTB supplements the original GNT with batching transactions)
2. monolithic - all the features described here are implemented in one, monolithic contract
3. hybrid - potentially, the final token contract can be a combination of the above - where some features beside the kill-switch are implemented in the base contract and some features are added in the add-on contracts

Ethworks should prepare an implementation proposal for both of those approaches alongside the main pros and cons for each one - or - if the hybrid solution is chosen - reasoning behind such decision.

Simple migration
----------------
Unless determined otherwise in the research, the migration from GNT should be triggered by setting the MigrationAgent to point to the new contract with no migration proxy. 

If there are strong arguments for using the MigrationProxy, they should be well laid out and considered before the final implementation recommendation.

No direct migration support
---------------------------
No provisions for a future migration.
If needed, the subsequent migration will be performed with the one-way wrapper, opt-in approach.

Microtransactions support + easier onboarding
---------------------------------------------
Still, the new token must contain some solution (to be decided/recommended) to enable gasless and/or nano-transactions (batching, layer2, gasless, et al)

* this requires further consideration, recommendation and specifics (from EthWorks) and further clarification once conclusions are reached...
* one of the considered scenarios should be the one where a Golem node that acquired some GNT tokens through providing, becomes a requestor - that should be possible without an additional on-ramping process (no additional requirement to e.g. get into possession of ETH)
* we want to support both on-ramping and off-ramping. Does ERC-20 compliance suffice or do additional features need to be added to the contract (or one of the cooperating contracts in case of the modular approach) to support them?

No governance
-------------
No governance built into contract whatsoever(*)

_Exception_

*Kill switch*

* The only functionality available to (and, more importantly, limited only to) the contract owner should be a time-constrained kill switch.
* The kill switch will be available only in the `transition_period` directly following the commencement of the migration.
* The owner should be set to Golem's Multisig.
* `transition_period` should be set to a specific value (TBD, e.g. two weeks to a month) when the contract is deployed.
* `transition_period` starts when the first migration from GNT is performed.
* execution of the kill switch function by the contract owner should completely stop the migration -> and in this unlikely event, the next migration will be performed by copying the contract's state and proceeding with normal `transfer` calls just as with a regular wrapper

*Reset owner*

(maybe it should be named e.g. `liberate` or something that suggests freeing the contract from any central control)
* one additonal, special, parameter-less method must be added to the contract to set the contract owner to `0` address
* this method will be callable by anyone
* the only condition to be verified is that the `transition_period` has passed


