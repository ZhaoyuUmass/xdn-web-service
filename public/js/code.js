/**
 * Created by gaozy on 8/10/17.
 */

const noop_code = "function run(value, accessor, querier) {\n\
    return value;\n\
}";

const random_code = 'function run(value, accessor, querier) {\n\
    var records = value["A"]["record"];\n\
    var rand = Math.ceil(Math.random()*records.length)-1;\n\
    value["A"]["record"] = records.slice(rand, rand+1);\n\
    return value;\n\
}';


const latency_code = 'function distance(lat1, lon1, lat2, lon2) {\n\
    if(lat1 == undefined || lat2 == undefined) return Number.MAX_VALUE;\n\
    var R = 6371; // Radius of the earth in km\n\
    var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below \n\
    var dLon = (lon2 - lon1) * Math.PI / 180; \n\
    var a = \n\
        0.5 - Math.cos(dLat)/2 + \n\
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * \n\
        (1 - Math.cos(dLon))/2; \n\
    \n\
    return R * 2 * Math.asin(Math.sqrt(a)); \n\
}\n\
\n\
function run(value, accessor, querier) {\n\
    var records = value.A.record,\n\
        client_ip = value.client_ip,\n\
        newRecords = [],\n\
        dist = [],\n\
        locs = records.slice(),\n\
        i=0;\n\
\n\
    locs.push(client_ip);\n\
\n\
    var coords = querier.getLocations(locs);\n\
    // do not calculate the distance for client\n\
    for(i=0; i<records.length; i++){\n\
        dist.push(Math.round(distance(coords[records[i]]["latitude"], coords[records[i]]["longitude"],\n\
            coords[client_ip]["latitude"], coords[client_ip]["longitude"])));\n\
    }\n\
\n\
    // figure out all candidates\n\
    var minimal_distance = Math.min.apply(Math, dist),\n\
        pos = 0,\n\
        k = 0\n\
    i=-1;\n\
\n\
    while ((i = dist.indexOf(minimal_distance, i+1)) != -1){\n\
        var diff = i-pos;\n\
        records.splice(k,diff);\n\
        k++;\n\
        pos = i;\n\
    }\n\
    records.splice(k,records.length-k);\n\
\n\
    return value;\n\
}';