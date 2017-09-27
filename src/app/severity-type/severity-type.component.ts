import { Component, OnInit } from '@angular/core';
import { ProviderAdminRoleService } from '../services/ProviderAdminServices/state-serviceline-role.service';
import { dataService } from '../services/dataService/data.service';
import { SeverityTypeService } from "../services/ProviderAdminServices/severity-type-service";

@Component({
  selector: 'app-severity-type',
  templateUrl: './severity-type.component.html',
  styleUrls: ['./severity-type.component.css']
})
export class SeverityTypeComponent implements OnInit {

  states: any= [];
  stateId: any;
  serviceProviderID: any;
  service: any;
  services: any =[];
  firstPage: boolean = true;
  description: any;
  severity: any;
  data: any = [];
  search:boolean = false;
  constructor(public ProviderAdminRoleService: ProviderAdminRoleService, public commonDataService: dataService,
    public severityTypeService: SeverityTypeService) { }

  ngOnInit() {
  	this.serviceProviderID =(this.commonDataService.service_providerID).toString();
  	this.ProviderAdminRoleService.getStates(this.serviceProviderID).subscribe(response=>this.states=this.successhandler(response));
  }
  successhandler(response) {
  	return response;
  }
  getServices(state) {
    this.search = true;
    this.service="";
  	this.ProviderAdminRoleService.getServices(this.serviceProviderID, state).subscribe(response => this.servicesSuccesshandeler(response));
  }
  servicesSuccesshandeler(response) {
  	console.log(response);
  	this.services = response.filter(function(obj){
  		return obj.serviceName == 104 || obj.serviceName == 1097 || obj.serviceName == "MCTS"
  	});
  }
  findSeverity(serObj) {
    this.severityTypeService.getSeverity(serObj.providerServiceMapID).subscribe(response=>this.getSeveritysuccesshandler(response));

  }
  getSeveritysuccesshandler(response) {
    debugger;
    this.data = response
  }
  addSeverity() {
  	this.handlingFlag(false);
  }
  add() {

  }
  handlingFlag(flag) {
  	this.firstPage = flag;
  }
}
