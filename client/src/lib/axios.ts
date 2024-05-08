import { dev } from "$app/environment";
import axios from "axios";

axios.defaults.baseURL = dev ? "http://localhost:5000/" : "/api/";
//axios.defaults.withCredentials = true;
