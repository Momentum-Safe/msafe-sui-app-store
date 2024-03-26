import axios, { AxiosInstance } from 'axios';

import { API_BASE_URL } from '../constants';
import type { ScallopAddressParams, AddressesInterface, AddressStringPath, NetworkType } from '../types';

/**
 * @description
 * It provides methods for managing addresses.
 *
 * @example
 * ```typescript
 * const scallopAddress = new ScallopAddress(<parameters>);
 * scallopAddress.<address functions>();
 * await scallopAddress.<address async functions>();
 * ```
 */
export class ScallopAddress {
  private readonly _auth?: string;

  private _requestClient: AxiosInstance;

  private _id?: string;

  private _network: NetworkType;

  private _currentAddresses?: AddressesInterface;

  private _addressesMap: Map<NetworkType, AddressesInterface>;

  public constructor(params: ScallopAddressParams) {
    const { id, auth, network } = params;

    if (auth) {
      this._auth = auth;
    }
    this._id = id;
    this._network = network || 'mainnet';
    this._addressesMap = new Map();
    this._requestClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get addresses API id.
   *
   * @return The addresses API id.
   */
  public getId() {
    return this._id || undefined;
  }

  /**
   * Get the address at the provided path.
   *
   * @param path - The path of the address to get.
   * @return The address at the provided path.
   */
  public get(path: AddressStringPath) {
    if (this._currentAddresses) {
      const value = path
        .split('.')
        .reduce(
          (nestedAddressObj: any, key: string) =>
            typeof nestedAddressObj === 'object' ? nestedAddressObj[key] : nestedAddressObj,
          this._currentAddresses,
        );
      return value || undefined;
    }
    return undefined;
  }

  /**
   * Sets the address for the specified path, it does not interact with the API.
   *
   * @param path - The path of the address to set.
   * @param address - The address be setted to the tartget path.
   * @return The addresses.
   */
  public set(path: AddressStringPath, address: string) {
    if (this._currentAddresses) {
      const keys = path.split('.');
      keys.reduce((nestedAddressObj: any, key: string, index) => {
        if (index === keys.length - 1) {
          const updatedAddressObj = nestedAddressObj;
          updatedAddressObj[key] = address;
        }
        return nestedAddressObj[key];
      }, this._currentAddresses);
    }
    return this._currentAddresses;
  }

  /**
   * Synchronize the specified network addresses from the addresses map to the
   * current addresses and change the default network to specified network.
   *
   * @param network - Specifies which network's addresses you want to get.
   * @return Current addresses.
   */
  public switchCurrentAddresses(network: NetworkType) {
    if (this._addressesMap.has(network)) {
      this._currentAddresses = this._addressesMap.get(network);
      this._network = network;
    }
    return this._currentAddresses;
  }

  /**
   * Get the addresses, If `network` is not provided, returns the current
   * addresses or the default network addresses in the addresses map.
   *
   * @param network - Specifies which network's addresses you want to get.
   */
  public getAddresses(network?: NetworkType) {
    if (network) {
      return this._addressesMap.get(network);
    }
    return this._currentAddresses ?? this._addressesMap.get(this._network);
  }

  /**
   * Set the addresses into addresses map. If the specified network is the same
   * as the current network, the current addresses will be updated at the same time.
   *
   * @param addresses - The addresses be setted to the tartget network.
   * @param network - Specifies which network's addresses you want to set.
   * @return The addresses.
   */
  public setAddresses(addresses: AddressesInterface, network?: NetworkType) {
    const targetNetwork = network || this._network;
    if (targetNetwork === this._network) {
      this._currentAddresses = addresses;
    }
    this._addressesMap.set(targetNetwork, addresses);
  }

  /**
   * Get all addresses.
   *
   * @return All addresses.
   */
  public getAllAddresses() {
    return Object.fromEntries(this._addressesMap);
  }

  /**
   * Read and synchronizes all addresses from the API into instance.
   *
   * @param id - The id of the addresses to get.
   * @return All addresses.
   */
  public async read(id?: string) {
    const addressesId = id || this._id || undefined;

    if (addressesId !== undefined) {
      const response = await this._requestClient.get(`${API_BASE_URL}/addresses/${addressesId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        Object.entries<AddressesInterface>(response.data).forEach(([network, addresses]) => {
          if (['localnet', 'devnet', 'testnet', 'mainnet'].includes(network)) {
            if (network === this._network) {
              this._currentAddresses = addresses;
            }
            this._addressesMap.set(network as NetworkType, addresses);
          }
        });
        this._id = response.data.id;
        return this.getAllAddresses();
      }
      throw Error('Failed to create addresses.');
    } else {
      throw Error('Please provide API addresses id.');
    }
  }
}
