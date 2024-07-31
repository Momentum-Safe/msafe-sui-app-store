import { config } from '../config';
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
  private id: string;
  private addresses: AddressesInterface;
  public maxRetries = 5;
  public retryDelayInMs = 1000;
  public constructor(params: ScallopAddressParams) {
    const { id } = params;
    this.id = id;
  }

  /**
   * Get addresses API id.
   *
   * @return The addresses API id.
   */
  public getId() {
    return this.id;
  }

  /**
   * Get the addresses, If `network` is not provided, returns the current
   * addresses or the default network addresses in the addresses map.
   *
   * @param network - Specifies which network's addresses you want to get.
   */
  public getAddresses() {
    return this.addresses;
  }

  /**
   * Get the address at the provided path.
   *
   * @param path - The path of the address to get.
   * @return The address at the provided path.
   */
  public get(path: AddressStringPath): string {
    if (!this.addresses) throw new Error(`Failed to fetch address ${this.id}`);
    const value = path
      .split('.')
      .reduce(
        (nestedAddressObj: any, key: string) =>
          typeof nestedAddressObj === 'object' ? nestedAddressObj[key] : nestedAddressObj,
        this.addresses,
      );
    return value;
  }

  public async read() {
    const options = {
      method: 'GET',
      headers: new Headers({ 'Content-Type': 'application/json' }),
    } as const;

    const response = await fetch(`${API_BASE_URL}/addresses/${this.id}`, options);
    if (response.status === 200) {
      const responseData = await response.json();

      if ('mainnet' in responseData) {
        this.addresses = responseData.mainnet;
        return;
      }
      throw new Error('Mainnet key is not in address!');
    }
    throw new Error(`Failed to fetch address with id ${this.id}`);
  }
}
