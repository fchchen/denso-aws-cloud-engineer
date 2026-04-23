/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const denso = $root.denso = (() => {

    /**
     * Namespace denso.
     * @exports denso
     * @namespace
     */
    const denso = {};

    denso.telemetry = (function() {

        /**
         * Namespace telemetry.
         * @memberof denso
         * @namespace
         */
        const telemetry = {};

        telemetry.v1 = (function() {

            /**
             * Namespace v1.
             * @memberof denso.telemetry
             * @namespace
             */
            const v1 = {};

            v1.VehicleTelemetry = (function() {

                /**
                 * Properties of a VehicleTelemetry.
                 * @memberof denso.telemetry.v1
                 * @interface IVehicleTelemetry
                 * @property {string|null} [deviceId] VehicleTelemetry deviceId
                 * @property {string|null} [tenantId] VehicleTelemetry tenantId
                 * @property {string|null} [timestamp] VehicleTelemetry timestamp
                 * @property {number|null} [speed] VehicleTelemetry speed
                 * @property {number|null} [rpm] VehicleTelemetry rpm
                 * @property {number|null} [fuel] VehicleTelemetry fuel
                 * @property {number|null} [lat] VehicleTelemetry lat
                 * @property {number|null} [lng] VehicleTelemetry lng
                 * @property {string|null} [messageId] VehicleTelemetry messageId
                 * @property {string|null} [receivedAt] VehicleTelemetry receivedAt
                 */

                /**
                 * Constructs a new VehicleTelemetry.
                 * @memberof denso.telemetry.v1
                 * @classdesc Represents a VehicleTelemetry.
                 * @implements IVehicleTelemetry
                 * @constructor
                 * @param {denso.telemetry.v1.IVehicleTelemetry=} [properties] Properties to set
                 */
                function VehicleTelemetry(properties) {
                    if (properties)
                        for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * VehicleTelemetry deviceId.
                 * @member {string} deviceId
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.deviceId = "";

                /**
                 * VehicleTelemetry tenantId.
                 * @member {string} tenantId
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.tenantId = "";

                /**
                 * VehicleTelemetry timestamp.
                 * @member {string} timestamp
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.timestamp = "";

                /**
                 * VehicleTelemetry speed.
                 * @member {number} speed
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.speed = 0;

                /**
                 * VehicleTelemetry rpm.
                 * @member {number} rpm
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.rpm = 0;

                /**
                 * VehicleTelemetry fuel.
                 * @member {number} fuel
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.fuel = 0;

                /**
                 * VehicleTelemetry lat.
                 * @member {number} lat
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.lat = 0;

                /**
                 * VehicleTelemetry lng.
                 * @member {number} lng
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.lng = 0;

                /**
                 * VehicleTelemetry messageId.
                 * @member {string} messageId
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.messageId = "";

                /**
                 * VehicleTelemetry receivedAt.
                 * @member {string} receivedAt
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 */
                VehicleTelemetry.prototype.receivedAt = "";

                /**
                 * Creates a new VehicleTelemetry instance using the specified properties.
                 * @function create
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {denso.telemetry.v1.IVehicleTelemetry=} [properties] Properties to set
                 * @returns {denso.telemetry.v1.VehicleTelemetry} VehicleTelemetry instance
                 */
                VehicleTelemetry.create = function create(properties) {
                    return new VehicleTelemetry(properties);
                };

                /**
                 * Encodes the specified VehicleTelemetry message. Does not implicitly {@link denso.telemetry.v1.VehicleTelemetry.verify|verify} messages.
                 * @function encode
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {denso.telemetry.v1.IVehicleTelemetry} message VehicleTelemetry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                VehicleTelemetry.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.deviceId != null && Object.hasOwnProperty.call(message, "deviceId"))
                        writer.uint32(/* id 1, wireType 2 =*/10).string(message.deviceId);
                    if (message.tenantId != null && Object.hasOwnProperty.call(message, "tenantId"))
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.tenantId);
                    if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                        writer.uint32(/* id 3, wireType 2 =*/26).string(message.timestamp);
                    if (message.speed != null && Object.hasOwnProperty.call(message, "speed"))
                        writer.uint32(/* id 4, wireType 5 =*/37).float(message.speed);
                    if (message.rpm != null && Object.hasOwnProperty.call(message, "rpm"))
                        writer.uint32(/* id 5, wireType 0 =*/40).int32(message.rpm);
                    if (message.fuel != null && Object.hasOwnProperty.call(message, "fuel"))
                        writer.uint32(/* id 6, wireType 5 =*/53).float(message.fuel);
                    if (message.lat != null && Object.hasOwnProperty.call(message, "lat"))
                        writer.uint32(/* id 7, wireType 1 =*/57).double(message.lat);
                    if (message.lng != null && Object.hasOwnProperty.call(message, "lng"))
                        writer.uint32(/* id 8, wireType 1 =*/65).double(message.lng);
                    if (message.messageId != null && Object.hasOwnProperty.call(message, "messageId"))
                        writer.uint32(/* id 9, wireType 2 =*/74).string(message.messageId);
                    if (message.receivedAt != null && Object.hasOwnProperty.call(message, "receivedAt"))
                        writer.uint32(/* id 10, wireType 2 =*/82).string(message.receivedAt);
                    return writer;
                };

                /**
                 * Encodes the specified VehicleTelemetry message, length delimited. Does not implicitly {@link denso.telemetry.v1.VehicleTelemetry.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {denso.telemetry.v1.IVehicleTelemetry} message VehicleTelemetry message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                VehicleTelemetry.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a VehicleTelemetry message from the specified reader or buffer.
                 * @function decode
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {denso.telemetry.v1.VehicleTelemetry} VehicleTelemetry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                VehicleTelemetry.decode = function decode(reader, length, error) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    let end = length === undefined ? reader.len : reader.pos + length, message = new $root.denso.telemetry.v1.VehicleTelemetry();
                    while (reader.pos < end) {
                        let tag = reader.uint32();
                        if (tag === error)
                            break;
                        switch (tag >>> 3) {
                        case 1: {
                                message.deviceId = reader.string();
                                break;
                            }
                        case 2: {
                                message.tenantId = reader.string();
                                break;
                            }
                        case 3: {
                                message.timestamp = reader.string();
                                break;
                            }
                        case 4: {
                                message.speed = reader.float();
                                break;
                            }
                        case 5: {
                                message.rpm = reader.int32();
                                break;
                            }
                        case 6: {
                                message.fuel = reader.float();
                                break;
                            }
                        case 7: {
                                message.lat = reader.double();
                                break;
                            }
                        case 8: {
                                message.lng = reader.double();
                                break;
                            }
                        case 9: {
                                message.messageId = reader.string();
                                break;
                            }
                        case 10: {
                                message.receivedAt = reader.string();
                                break;
                            }
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a VehicleTelemetry message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {denso.telemetry.v1.VehicleTelemetry} VehicleTelemetry
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                VehicleTelemetry.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a VehicleTelemetry message.
                 * @function verify
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                VehicleTelemetry.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.deviceId != null && message.hasOwnProperty("deviceId"))
                        if (!$util.isString(message.deviceId))
                            return "deviceId: string expected";
                    if (message.tenantId != null && message.hasOwnProperty("tenantId"))
                        if (!$util.isString(message.tenantId))
                            return "tenantId: string expected";
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        if (!$util.isString(message.timestamp))
                            return "timestamp: string expected";
                    if (message.speed != null && message.hasOwnProperty("speed"))
                        if (typeof message.speed !== "number")
                            return "speed: number expected";
                    if (message.rpm != null && message.hasOwnProperty("rpm"))
                        if (!$util.isInteger(message.rpm))
                            return "rpm: integer expected";
                    if (message.fuel != null && message.hasOwnProperty("fuel"))
                        if (typeof message.fuel !== "number")
                            return "fuel: number expected";
                    if (message.lat != null && message.hasOwnProperty("lat"))
                        if (typeof message.lat !== "number")
                            return "lat: number expected";
                    if (message.lng != null && message.hasOwnProperty("lng"))
                        if (typeof message.lng !== "number")
                            return "lng: number expected";
                    if (message.messageId != null && message.hasOwnProperty("messageId"))
                        if (!$util.isString(message.messageId))
                            return "messageId: string expected";
                    if (message.receivedAt != null && message.hasOwnProperty("receivedAt"))
                        if (!$util.isString(message.receivedAt))
                            return "receivedAt: string expected";
                    return null;
                };

                /**
                 * Creates a VehicleTelemetry message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {denso.telemetry.v1.VehicleTelemetry} VehicleTelemetry
                 */
                VehicleTelemetry.fromObject = function fromObject(object) {
                    if (object instanceof $root.denso.telemetry.v1.VehicleTelemetry)
                        return object;
                    let message = new $root.denso.telemetry.v1.VehicleTelemetry();
                    if (object.deviceId != null)
                        message.deviceId = String(object.deviceId);
                    if (object.tenantId != null)
                        message.tenantId = String(object.tenantId);
                    if (object.timestamp != null)
                        message.timestamp = String(object.timestamp);
                    if (object.speed != null)
                        message.speed = Number(object.speed);
                    if (object.rpm != null)
                        message.rpm = object.rpm | 0;
                    if (object.fuel != null)
                        message.fuel = Number(object.fuel);
                    if (object.lat != null)
                        message.lat = Number(object.lat);
                    if (object.lng != null)
                        message.lng = Number(object.lng);
                    if (object.messageId != null)
                        message.messageId = String(object.messageId);
                    if (object.receivedAt != null)
                        message.receivedAt = String(object.receivedAt);
                    return message;
                };

                /**
                 * Creates a plain object from a VehicleTelemetry message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {denso.telemetry.v1.VehicleTelemetry} message VehicleTelemetry
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                VehicleTelemetry.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    let object = {};
                    if (options.defaults) {
                        object.deviceId = "";
                        object.tenantId = "";
                        object.timestamp = "";
                        object.speed = 0;
                        object.rpm = 0;
                        object.fuel = 0;
                        object.lat = 0;
                        object.lng = 0;
                        object.messageId = "";
                        object.receivedAt = "";
                    }
                    if (message.deviceId != null && message.hasOwnProperty("deviceId"))
                        object.deviceId = message.deviceId;
                    if (message.tenantId != null && message.hasOwnProperty("tenantId"))
                        object.tenantId = message.tenantId;
                    if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                        object.timestamp = message.timestamp;
                    if (message.speed != null && message.hasOwnProperty("speed"))
                        object.speed = options.json && !isFinite(message.speed) ? String(message.speed) : message.speed;
                    if (message.rpm != null && message.hasOwnProperty("rpm"))
                        object.rpm = message.rpm;
                    if (message.fuel != null && message.hasOwnProperty("fuel"))
                        object.fuel = options.json && !isFinite(message.fuel) ? String(message.fuel) : message.fuel;
                    if (message.lat != null && message.hasOwnProperty("lat"))
                        object.lat = options.json && !isFinite(message.lat) ? String(message.lat) : message.lat;
                    if (message.lng != null && message.hasOwnProperty("lng"))
                        object.lng = options.json && !isFinite(message.lng) ? String(message.lng) : message.lng;
                    if (message.messageId != null && message.hasOwnProperty("messageId"))
                        object.messageId = message.messageId;
                    if (message.receivedAt != null && message.hasOwnProperty("receivedAt"))
                        object.receivedAt = message.receivedAt;
                    return object;
                };

                /**
                 * Converts this VehicleTelemetry to JSON.
                 * @function toJSON
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                VehicleTelemetry.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                /**
                 * Gets the default type url for VehicleTelemetry
                 * @function getTypeUrl
                 * @memberof denso.telemetry.v1.VehicleTelemetry
                 * @static
                 * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns {string} The default type url
                 */
                VehicleTelemetry.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
                    if (typeUrlPrefix === undefined) {
                        typeUrlPrefix = "type.googleapis.com";
                    }
                    return typeUrlPrefix + "/denso.telemetry.v1.VehicleTelemetry";
                };

                return VehicleTelemetry;
            })();

            return v1;
        })();

        return telemetry;
    })();

    return denso;
})();

export { $root as default };
