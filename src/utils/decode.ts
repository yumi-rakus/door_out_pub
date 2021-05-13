import axios from "axios";
import { ROADS_API_URL } from "./globalVariables";
import { API_KEY } from "~/api.config";
import { Coordinate } from "~/interfaces";

/**
 * エンコードされたpolyline文字列をデコードする関数
 * @returns 緯度経度が書かれたオブジェクト{lat: xxx, lat: xxx}の配列
 */
const decode = (value: string) => {
  const PRECISION = 1e5;
  let points: Array<Coordinate> = [];
  let lat: number = 0;
  let lon: number = 0;
  decode.integers(value, (x: number, y: number) => {
    lat += x;
    lon += y;
    points.push({ lat: lat / PRECISION, lng: lon / PRECISION });
  });
  return snapOnRoadsAPI(points);
};

decode.sign = (value: number) => {
  return value & 1 ? ~(value >>> 1) : value >>> 1;
};

decode.integers = (
  value: string,
  callback: (arg1: number, arg2: number) => void
) => {
  let values = 0;
  let x = 0;
  let y = 0;

  let byte = 0;
  let current = 0;
  let bits = 0;

  for (let i = 0; i < value.length; i++) {
    byte = value.charCodeAt(i) - 63;
    current = current | ((byte & 0x1f) << bits);
    bits = bits + 5;

    if (byte < 0x20) {
      if (++values & 1) {
        x = decode.sign(current);
      } else {
        y = decode.sign(current);
        callback(x, y);
      }
      current = 0;
      bits = 0;
    }
  }

  return values;
};

const snapOnRoadsAPI = async (points: Array<Coordinate>) => {
  let pathParam: string[] = [];
  points.forEach(point => {
    pathParam.push(`${point.lat}, ${point.lng}`);
  });
  const path = pathParam.join("|");
  const res = await axios.get(ROADS_API_URL, {
    params: {
      path: path,
      key: API_KEY,
      interpolate: true
    }
  });
  let snappedPath: Array<Coordinate> = [];
  res.data.snappedPoints.forEach((snappedPoint: any) => {
    snappedPath.push({
      lat: snappedPoint.location.latitude,
      lng: snappedPoint.location.longitude
    });
  });
  return snappedPath;
};

export default decode;
