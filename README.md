# JKBot - Screeps

## Approach

Jkbot follows my own take on an OS based approach, with a focus on minimizing code reuse. 

This is noticeable in a lot of areas, but an example are the various lifecycle processes. These represent the creep's roles and switch to various child processes depending on the action the creep is taking. These creep action processes are shared between the roles.