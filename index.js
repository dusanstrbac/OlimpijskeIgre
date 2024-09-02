// CITANJE JSON FAJLA
const fs = require('fs');
const groups = JSON.parse(fs.readFileSync('groups.json', 'utf8'));


// Napraviti da se rezultat pravi po statistici timova rangiranim po FIBA rankig-u
// Da vecu sansu imaju timovi koji su visi na FIBA tabeli
function simulirajUtakmicu (teamA, teamB) {
    const baseRezultat = () => Math.floor( Math.random() * 100 ) + 50; // Daje random broj
    const rezultatA = baseRezultat();
    const rezultatB = baseRezultat();

    return [ rezultatA, rezultatB ];
}

function simulirajGrupnuFazu() {
    const tabela = [];
    const rezultati = [];
    let teamA;
    let teamB;

// GRUPNA FAZA TAKMICENJA 
    for ( const group in groups ) {
        rezultati[group] = [];
        tabela[group] = groups[group].map(team => ({
            Team: team.Team,
            Pobede: 0,
            Porazi: 0,
            Neresenih: 0,
            Bodovi: 0,
            PostignutihPoena: 0,
            PrimljeniihPoena: 0,
            KosRazlika: 0
        }));

        for ( let i = 0; i < tabela[group].length; i++ ) {
            for ( let j = i + 1; j < tabela[group].length; j++ ) {
                teamA = tabela[group][i];
                teamB = tabela[group][j];  
                const [ rezultatA, rezultatB ] = simulirajUtakmicu( teamA.Team, teamB.Team );
            
                if ( rezultatA < rezultatB ) {
                    teamA.Pobede++;
                    teamB.Porazi++;
                    teamA.Bodovi += 2;
                    teamB.Bodovi++;            
                } else if ( rezultatA > rezultatB ) {
                    teamA.Porazi++;
                    teamB.Pobede++;
                    teamA.Bodovi++;
                    teamB.Bodovi += 2;
                } else if ( rezultatA == rezultatB ) {
                    teamA.Neresenih++;
                    teamB.Neresenih++;
                }
                teamA.PostignutihPoena += rezultatA;
                teamA.PrimljeniihPoena += rezultatB;
                teamB.PostignutihPoena += rezultatB;
                teamB.PrimljeniihPoena += rezultatA;

                teamA.KosRazlika = teamA.PostignutihPoena - teamA.PrimljeniihPoena;
                teamB.KosRazlika = teamB.PostignutihPoena - teamB.PrimljeniihPoena;

                rezultati[group].push(`${teamA.Team} vs ${teamB.Team}\nRezultat: ${rezultatA} : ${rezultatB}`);         
            
            }
        }
    }
    console.log("GRUPNA FAZA TAKMIČENJA");
    for ( const group in rezultati ) {
        console.log(`\nGrupa ${group}:`);
        rezultati[group].forEach(rezultat => console.log(`\n${rezultat}`));
    }
    console.log(`\nTABELA NA KRAJU GRUPNE FAZE TAKMIČENJA:`);
    for ( const group in tabela ) {
        console.log(`\nGrupa ${group}`);
        tabela[group].sort(( a, b) => b.Bodovi - a.Bodovi || b.KosRazlika - a.KosRazlika );
        tabela[group].forEach(( team, index ) => {
            console.log(`${index + 1}. ${team.Team} | ${team.Pobede} | ${team.Porazi} | ${team.Neresenih} | ${team.Bodovi} | ${team.PostignutihPoena} | ${team.PrimljeniihPoena} | ${team.KosRazlika}`);
        });
    }
// TIMOVI KOJI SU SE PLASIRALI DALJE
    const prolaznici = Object.values(tabela).flat().sort((a, b) => b.Bodovi - a.Bodovi || b.KosRazlika - a.KosRazlika || b.PostignutihPoena - a.PostignutihPoena);
    const prolazniTimovi = prolaznici.slice( 0, 8 );

    console.log(`\nTIMOVI KOJI SU SE PLASIRALI U SLEDECI KRUG TAKMIČENJA`);
    prolazniTimovi.forEach(( team, index ) => console.log(`${ index + 1 }. ${ team.Team }`));

// KREIRANJE SESIRA OD TIMOVA KOJI SU SE DALJE PLASIRALI
    const prviSesir = prolazniTimovi.slice ( 0, 2 );
    const drugiSesir = prolazniTimovi.slice ( 2, 4 );
    const treciSesir = prolazniTimovi.slice ( 4, 6 );
    const cetvrtiSesir = prolazniTimovi.slice ( 6, 8 );

// KREIRANJE CETVRTINE FINALA
    const rezultati1 = [];
    const polufinale = [];
    teamA = prviSesir;
    teamC = drugiSesir;


    teamA.forEach( teamA => {
        teamB = izvuciNasumicno ( cetvrtiSesir );
        const [ rezultatA, rezultatB ] = simulirajUtakmicu( teamA.Team, teamB.Team );
        rezultati1.push(`\n${teamA.Team} vs ${teamB.Team}\nRezultat: ${rezultatA} : ${rezultatB}`);
        
        if ( rezultatA > rezultatB ) { // Ukoliko teamA pobedi teamB
            polufinale.push( teamA );
        } else if ( rezultatA > rezultatB ) {
            polufinale.push( teamB );
        } else if ( rezultatA == rezultatB ) {
            simulirajUtakmicu( teamA.Team, teamB.Team );
        }
    });

    teamC.forEach( teamC => {
        teamD = izvuciNasumicno ( treciSesir );
        const [ rezultatC, rezultatD ] = simulirajUtakmicu ( teamC.Team, teamD.Team );
        rezultati1.push(`\n${teamC.Team} vs ${teamD.Team}\nRezultat: ${rezultatC} : ${rezultatD}`);

        if ( rezultatC > rezultatD ) { // Ukoliko teamC pobedi teamD
            polufinale.push(teamC);
        } else if ( rezultatC < rezultatD ) {
            polufinale.push(teamD);
        }
    });

    console.log("\nCETVRTINA FINALA:");
    rezultati1.forEach(rezultat => console.log( `${rezultat}` ));

// POLUFINALE TAKMIČENJA
    const rezultati2 = [];
    const finale = [];
    const treceMesto = []; // Array za drzave koje se bore za bronzanu medalju na takmičenju

    teamA = polufinale;

    teamA.forEach( teamA => {
        teamB = izvuciNasumicno(polufinale);
        const [ rezultatA, rezultatB ] = simulirajUtakmicu ( teamA.Team, teamB.Team );
        rezultati2.push(`\n${teamA.Team} vs ${teamB.Team}\nRezultat: ${rezultatA} : ${rezultatB}`);
    
        if ( rezultatA > rezultatB ) {
            finale.push( teamA );
            treceMesto.push( teamB );
        } else if ( rezultatA < rezultatB ) {
            finale.push( teamB );
            treceMesto.push( teamA );
        } else if ( rezultatA == rezultatB ) {
            simulirajUtakmicu( teamA.Team, teamB.Team );
        }
    });

    console.log("\nPOLUFINALE:");
    rezultati2.forEach(rezultat => console.log( `${rezultat}`));

// BORBA ZA TRECE MESTO
    teamA = treceMesto[0];
    teamB = treceMesto[1];
    let [ rezultatA, rezultatB ] = simulirajUtakmicu ( teamA.Team, teamB.Team );
    const rezultati3 = [];
    const krajnjaTabela = [];

    if ( rezultatA > rezultatB ) { // Ukoliko je teamA pobedio teamB stavlja ga u array za prva tri mesta na takmičenju
        krajnjaTabela.push( teamA );
    } else if ( rezultatA < rezultatB ) {
        krajnjaTabela.push( teamB );
    } else if ( rezultatA == rezultatB ) { // Utakmica se ne moze u ovaj fazi završiti nerešenim rezultatom
        simulirajUtakmicu ( teamA.Team, teamB.Team );
    }

    console.log("\nUTAKMICA ZA TREĆE MESTO NA TAKMIČENJU");
    rezultati3.push(`\n${teamA.Team} vs ${teamB.Team}\nRezultat: ${rezultatA} : ${rezultatB}` );
    rezultati3.forEach(rezultat => console.log(`${rezultat}`));

// FINALE TAKMIČENJA
    teamA = finale[0];
    teamB = finale[1];
    let [ rezultatC, rezultatD ] = simulirajUtakmicu ( teamA.Team, teamB.Team );
    const rezultati4 = [];

    if ( rezultatC > rezultatD ) {
        krajnjaTabela.push( teamA );
        krajnjaTabela.push( teamB );
    } else if ( rezultatC < rezultatD ) {
        krajnjaTabela.push( teamB );
        krajnjaTabela.push( teamA );
    }

    console.log("\nFinale takmičenja");
    rezultati4.push(`\n${teamA.Team} vs ${teamB.Team}\nRezultat: ${rezultatA} : ${rezultatB}` );
    rezultati4.forEach( rezultat => console.log( `${rezultat }` ));

// PRIKAZIVANJE PRVA 3 MESTA NA TAKMIČENJU

    console.log("\nTABELA SA POBEDNICIMA NA TURNIRU:");
    krajnjaTabela.forEach(( team, index ) => {
        console.log(` ${index + 1 }. ${team.Team}`);
    });

}

function izvuciNasumicno(teamList) {
    const randomIndex = Math.floor(Math.random() * teamList.length);
    return teamList[randomIndex];
}


function main() {
    simulirajGrupnuFazu();
}


main();