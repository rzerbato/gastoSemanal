

//============================================================================
//                         Variables y selectores
//============================================================================
const formulario = document.querySelector("#agregar-gasto");
const listadoGasto = document.querySelector("#gastos ul");



//============================================================================
//                                 Eventos
//============================================================================
eventListeners();

function eventListeners(){
    document.addEventListener("DOMContentLoaded", preguntarPresupuesto);
    formulario.addEventListener("submit", agregarGasto);
}


//============================================================================
//                                  Clases
//============================================================================
class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.saldo = Number(presupuesto);
        this.gastos = [];
    } 

    nuevoGasto( gasto ){
        this.gastos = [ ...this.gastos, gasto ];
        this.calcularSaldo();
    }

    calcularSaldo(){
        const gastado = this.gastos.reduce( (total, gasto ) => total + gasto.monto, 0 );
        this.saldo = this.presupuesto - gastado;
    }

    eliminarGasto(id){
        console.log(id);
        this.gastos = this.gastos.filter( gasto => gasto.id !== id );
        this.calcularSaldo();
    }

}


class UI {
    insertarPresupuesto( budget ){
        const{ presupuesto, saldo } = budget;
        document.querySelector("#total").textContent = presupuesto;
        document.querySelector("#restante").textContent = saldo;
    }

    imprimirAlerta( mensaje, tipo ){
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if( tipo === 'error' ){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }

        //Mensaje error
        divMensaje.textContent = mensaje;

        //inserto en el html
        document.querySelector(".primario").insertBefore( divMensaje, formulario );

        //Elimino el mensaje a los 3 seg
        setTimeout(() => {
           divMensaje.remove(); 
        }, 3000);
    }

    mostrarGastos( gastos ){

        this.limpiarHTML();

        gastos.forEach(gasto => {
            const { monto, nombre, id } = gasto;
            
            //crear li
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            nuevoGasto.innerHTML = `${nombre} <span class="badge badge-primary badge-pill">$ ${monto} </span>`;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML =('Borrar &times;')
            btnBorrar.onclick = () =>{ 
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);

            //Agregar al HTML
            listadoGasto.appendChild(nuevoGasto);

        });
    }

    limpiarHTML(){
        while(listadoGasto.firstChild){
            listadoGasto.removeChild(listadoGasto.firstChild);
        }
    }

    actualizarSaldo(saldo){
        document.querySelector("#restante").textContent = saldo;
    }

    comprobarPresupuesto(presupuestoObj){
        const { presupuesto, saldo } = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');

        //Comprobar 25%
        if( (presupuesto / 4) > saldo){
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-danger');
        } else if( (presupuesto / 2) > saldo){ //Comprueba 50%
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        }else{
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        //Si el saldo es menor o igual a 0
        if(saldo <= 0){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            formulario.querySelector('button[type=submit]').disabled = true;
        }else{
            formulario.querySelector('button[type=submit]').disabled = false;
        }

    }
}


//============================================================================
//                                Funciones
//============================================================================
let presupuesto;
const ui = new UI();
function preguntarPresupuesto(){
    const presupuestoUsuario = prompt("¿Cuál es tu presupuesto?");

    if( presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ){
        window.location.reload();
    }
    presupuesto = new Presupuesto(presupuestoUsuario);
    ui.insertarPresupuesto(presupuesto);
}

function agregarGasto(e){
    e.preventDefault();

    //Obtengo datos del form
    const nombre = document.querySelector("#gasto").value;
    const monto = Number(document.querySelector("#cantidad").value);

    //Valido que los campos no estén vacíos
    if(nombre === '' || monto === ''){
        ui.imprimirAlerta("Ambos campos son obligatorios", "error");
        return;
    }else if( monto <= 0 || isNaN( monto )){
        ui.imprimirAlerta("Cantidad inválida", "error");
        return;
    }

    //crear gasto
    const gasto = { 
        nombre, 
        monto, 
        id: Date.now() 
    }
    //Agrego el gasto
    presupuesto.nuevoGasto(gasto);
    ui.imprimirAlerta( "¡Gasto agregado correctamente!");

    //Imprimo los gastos
    const { gastos, saldo } = presupuesto;
    ui.mostrarGastos(gastos)

    ui.actualizarSaldo(saldo);

    ui.comprobarPresupuesto( presupuesto );

    //Limpio el form
    formulario.reset();

}

function eliminarGasto(id){

    //Eliminar gasto del presupuesto
    presupuesto.eliminarGasto(id);

    //Eliminar gasto del HTML
    const { gastos, saldo } = presupuesto;
    ui.mostrarGastos(gastos);

    ui.actualizarSaldo(saldo);
    ui.comprobarPresupuesto(presupuesto);


}