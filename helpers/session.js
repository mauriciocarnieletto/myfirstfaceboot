'use strict'
// NodeCache
const NodeCache = require('node-cache');
const myCache = new NodeCache();

var util = require('util');
/**
 * Facebook
 */
function Session() {

    return {
    	/*
    	 * Get current Session
    	 */
    	get: function (sessionId, property) {
 			
 			var session = myCache.get(sessionId);

 			return 
 					(typeof property === "undefined" ) 
						? session 
						: (typeof session[property] !== "undefined")
							? session[property] 
							: false;
    	},
    	/*
    	 * Set a new Session, if it already exists, update it
    	 */
    	set: function (sessionId, obj) {

    		if(this.get(sessionId)) 
    			return this.put(sessionId, obj);

			return myCache.set(sessionId, obj);
    	},
    	/*
    	 * Update Session
    	 */
    	put: function (sessionId, objs) { 

    		var oldSession = this.get(sessionId);

    		return myCache.set(Object.assign({}, oldSession, objs));
    	}
    };
};

module.exports = Session;