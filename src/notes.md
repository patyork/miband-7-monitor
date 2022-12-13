Time  
Dates seem to be TIMEZONE off, plus 16 (or less likely 15) minutes. I think that JS is applying the local timezone, and that the representation of the minute is off by 0x1 : either on the watch or in JS?




On putting watch on:  
`03 03 00 4a 00 15 00 00 00 29 00 04 0f 22 00 3a 08 02 05 16 1c 10 e0 3a 08 02 05 16 1c 10 e0 00`  
`03 07 00 4d 00 02 00 00 00 1b 00 04 01`  
`03 03 00 4e 00 15 00 00 00 29 00 04 0f 21 00 3a 08 02 05 16 1c 10 e0 3a 08 02 05 16 1c 10 e0 00` appeared to be right after first HR measurement once put on?  


Intermittent (while not worn?):  
`03 07 00 49 00 01 00 00 00 15 00 03`  
`status--count-------unkn`  
`03 07 00 4b 00 01 00 00 00 15 00 03`  
`03 07 00 4c 00 01 00 00 00 15 00 03`  

Battery: On % change, sent to MIBAND_SERVICE -> CHUNKED_READ  
`03 03 00 56 00 15 00 00 00 29 00 04 0f 21 00 3a 08 02 05 16 1c 10 e0 3a 08 02 05 16 1c 10 e0 00`  
`03 03 00 57 00 15 00 00 00 29 00 04 0f 21 00 3a 08 02 05 16 1c 10 e0 3a 08 02 05 16 1c 10 e0 00` Only charged before pairing, no time info? (33%/x21)   
`03 03 00 59 00 15 00 00 00 29 00 04 0f 21 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0d 3b 02 e0 00` Time set, starting charging (33%/x21)   
`03 03 00 5a 00 15 00 00 00 29 00 04 0f 21 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0d 3b 02 e0 00` Charging, a minute or so later (33%/x21)   
`03 03 00 5b 00 15 00 00 00 29 00 04 0f 22 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0d 3b 02 e0 00` Automatically sent on percentage change? (34%/x22)   
`03 03 00 67 00 15 00 00 00 29 00 04 0f 36 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0d 3b 02 e0 00` x36%   

Just taken off charger notifications  
`03 03 00 69 00 15 00 00 00 29 00 04 0f 39 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0d 3b 02 e0 00` << Charging  
`03 03 00 6a 00 15 00 00 00 29 00 04 0f 39 00 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 10 08 e0 39` << Off charger  
`03 03 00 6b 00 15 00 00 00 29 00 04 0f 39 00 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 10 08 e0 39` << Off Charger still  

Off charger, READ value:  
`03 03 00 6c 00 15 00 00 00 29 00 04 0f 39 00 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 10 08 e0 39` Samesies  

Back on charger, watch never put back on:  
`03 03 00 6d 00 15 00 00 00 29 00 04 0f 39 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 19 14 e0 39`  

Waiting for 100% charge  
`03 03 00 8f 00 15 00 00 00 29 00 04 0f 62 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 19 14 e0 39` Charging still  
`03 03 00 91 00 15 00 00 00 29 00 04 0f 63 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 19 14 e0 39` Still charging, stuck at 99%  
`03 03 00 92 00 15 00 00 00 29 00 04 0f 64 01 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 19 14 e0 39` Hit 100%  
`03 03 00 93 00 15 00 00 00 29 00 04 0f 64 00 3a 08 02 05 16 1c 10 e0 e6 07 0c 0a 0e 19 14 e0 39` immediately after hitting 100%, no longer charging  

Removed from charger, now worn  
`03 03 00 94 00 15 00 00 00 29 00 04 0f 64 00 e6 07 0c 0a 0f 1b 34 e0 e6 07 0c 0a 0f 1b 34 e0 64` removed from charger  
`03 03 00 95 00 15 00 00 00 29 00 04 0f 64 00 e6 07 0c 0a 0f 1b 34 e0 e6 07 0c 0a 0f 1b 34 e0 64` immediatly, removed and worn

Back down to 99  
`03 03 00 99 00 15 00 00 00 29 00 04 0f 63 00 e6 07 0c 0a 0f 1b 34 e0 e6 07 0c 0a 0f 1b 34 e0 64`