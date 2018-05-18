import { Component, OnInit, ViewChild } from '@angular/core';
import { ProviderAdminRoleService } from "../services/ProviderAdminServices/state-serviceline-role.service";
import { dataService } from '../services/dataService/data.service';
import { DrugMasterService } from '../services/ProviderAdminServices/drug-master-services.service';
import { ConfirmationDialogsService } from './../services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-drug-mapping',
  templateUrl: './drug-mapping.component.html'
})
export class DrugMappingComponent implements OnInit {

  showMappings: any = true;
  availableDrugMappings: any = [];
  availableDrugGroups: any = [];
  availableDrugs: any = [];
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  editable: any = false;
  serviceID104: any;
  createdBy: any;
  mappedDrugs: any = [];


  @ViewChild('drugMappingForm') drugMappingForm: NgForm;
  constructor(public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public drugMasterService: DrugMasterService,
    private alertMessage: ConfirmationDialogsService) {
    this.data = [];
    this.service_provider_id = this.commonDataService.service_providerID;
    this.serviceID104 = this.commonDataService.serviceID104;
    this.createdBy = this.commonDataService.uname;

  }

  ngOnInit() {
    this.getStatesByServiceID();
    this.getAvailableMappings();
    this.getAvailableDrugGroups();
    this.getAvailableDrugs();
  }

  stateSelection(stateID) {
    this.getServices(stateID);
  }
  getAvailableMappings() {
    this.drugObj = {};
    this.drugObj.serviceProviderID = this.service_provider_id;
    this.drugObj.serviceID = this.serviceID104;
    this.drugMasterService.getDrugMappings(this.drugObj).subscribe(response => this.getDrugMappingsSuccessHandeler(response),
      (err) => this.alertMessage.alert(err, 'error'));
  }

  getDrugMappingsSuccessHandeler(response) {
    this.availableDrugMappings = response;
  }

  getAvailableDrugGroups() {
    this.drugObj = {};
    this.drugObj.deleted = false;
    this.drugObj.serviceProviderID = this.service_provider_id;
    this.drugMasterService.getDrugGroups(this.drugObj).subscribe(response => this.getDrugGroupsSuccessHandeler(response),
      (err) => this.alertMessage.alert(err, 'error'));
  }
  getDrugGroupsSuccessHandeler(response) {
    this.availableDrugGroups = response;
  }

  getAvailableDrugs() {
    this.drugObj = {};
    this.drugObj.deleted = false;
    this.drugObj.serviceProviderID = this.service_provider_id;
    this.drugMasterService.getDrugsList(this.drugObj).subscribe(response => this.getDrugsSuccessHandeler(response),
      (err) => this.alertMessage.alert(err, 'error'));
  }

  getDrugsSuccessHandeler(response) {
    this.availableDrugs = response;
  }

  getServices(stateID) {
    this.providerAdminRoleService.getServices(this.service_provider_id, stateID).subscribe(response => this.getServicesSuccessHandeler(response),
      (err) => this.alertMessage.alert(err, 'error'));
  }

  getStates() {
    this.providerAdminRoleService.getStates(this.service_provider_id).subscribe(response => this.getStatesSuccessHandeler(response),
      (err) => this.alertMessage.alert(err, 'error'));
  }

  getStatesByServiceID() {
    this.drugMasterService.getStatesByServiceID(this.serviceID104, this.service_provider_id).subscribe(response => this.getStatesSuccessHandeler(response),
      (err) => this.alertMessage.alert(err, 'error'));
  }


  getStatesSuccessHandeler(response) {
    this.provider_states = response;
  }

  getServicesSuccessHandeler(response) {
    this.provider_services = response;
    for (let provider_service of this.provider_services) {
      if ("104" == provider_service.serviceName) {
        this.providerServiceMapID = provider_service.providerServiceMapID;
      }
    }
  }

  responseHandler(response) {
    this.data = response;
  }


  showForm() {
    this.showMappings = false;
  }

  drugObj: any;
  // = {
  // 	'drug':'',
  //   'drugDesc':'',
  //   'providerServiceMapID':'',
  //   'createdBy':''
  // };
  drugMapping: any = [];
  drugIdList: any = [];
  mappedDrugIDs: any = [];
  addDrugToList(values) {

    let drugIdList = [];
    for (let drugs of values.drugIdList) {
      drugIdList.push(drugs.split("-")[0]);
      console.log("drugIdList", this.drugIdList);

    }

    //find drug deselected from the list , and Remove drugGroup mapping with that drug
    for (let mappedDrug of this.mappedDrugs) {
      this.mappedDrugIDs.push(mappedDrug.drugId); // fetching mapped drugID's

      this.dataObj = {};
      this.dataObj.drugMapID = mappedDrug.drugMapID;
      this.dataObj.modifiedBy = this.createdBy;
      if (drugIdList.indexOf(mappedDrug.drugId.toString()) == -1) {
        this.dataObj.deleted = true;
        this.drugMasterService.updateDrugStatus(this.dataObj).subscribe(response => this.updateStatusHandler(response),
          (err) => this.alertMessage.alert(err, 'error'));
      } else if (mappedDrug.deleted) {
        this.dataObj.deleted = false;
        this.drugMasterService.updateDrugStatus(this.dataObj).subscribe(response => this.updateStatusHandler(response),
          (err) => this.alertMessage.alert(err, 'error'));
      }
    }

    for (let drugIds of values.drugIdList) {
      let drugId = drugIds.split("-")[0];
      //make a map of drug group with Drug, If the drugId not in the mappedDrugIDs( already mapped drugID's)
      if (this.mappedDrugIDs.indexOf(parseInt(drugId)) == -1) {

        this.drugObj = {};
        this.drugObj.drugGroupID = values.drugGroupID.split("-")[0];
        this.drugObj.drugGroupName = values.drugGroupID.split("-")[1];
        this.drugObj.drugId = drugIds.split("-")[0];
        this.drugObj.drugName = drugIds.split("-")[1];
        this.drugObj.remarks = values.remarks;
        // for(let provider_service of this.provider_services){
        //   if("104"==provider_service.serviceName){
        this.drugObj.providerServiceMapID = this.providerServiceMapID;
        this.drugObj.stateName = values.stateID.split("-")[1];
        //   }
        // } 

        this.drugObj.createdBy = this.createdBy;
        this.checkDuplicates(this.drugObj);
        // this.drugMapping.push(this.drugObj);
      } else {
        console.log("already mapped with these drugs");
        this.alertMessage.alert("Already mapped with these drugs");
      }
    }

  }
  checkDuplicates(object) {
    let duplicateStatus = 0
    if (this.drugMapping.length === 0) {
      this.drugMapping.push(object);
    }
    else {
      debugger;
      for (let i = 0; i < this.drugMapping.length; i++) {
        if (this.drugMapping[i].drugId === object.drugId && this.drugMapping[i].drugGroupID === object.drugGroupID) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        this.drugMapping.push(object);
      }
      else {
        this.alertMessage.alert("Already exists");
      }
    }
  }

  storedrugMappings() {
    let obj = { "drugMappings": this.drugMapping };
    this.drugMasterService.mapDrugGroups(JSON.stringify(obj)).subscribe(response => this.successHandler(response));
  }

  successHandler(response) {
    this.drugMapping = [];
    this.alertMessage.alert("Saved successfully", 'success');
    this.getAvailableMappings();
    this.clearEdit();
  }

  dataObj: any = {};
  updateDrugMappingStatus(drugMapping) {
    let flag = !drugMapping.deleted;
    let status;
    if (flag === true) {
      status = "Deactivate";
    }
    if (flag === false) {
      status = "Activate";
    }
    this.alertMessage.confirm('Confirm', "Are you sure you want to " + status + "?").subscribe(response => {
      if (response) {

        this.dataObj = {};
        this.dataObj.drugMapID = drugMapping.drugMapID;
        this.dataObj.deleted = !drugMapping.deleted;
        this.dataObj.modifiedBy = this.createdBy;
        this.drugMasterService.updateDrugStatus(this.dataObj).subscribe(response => {
          this.alertMessage.alert(status + "d successfully", 'success')
          drugMapping.deleted = !drugMapping.deleted
        }), (err) => {
          console.log("error", err);
          //this.alertMessage.alert(err, 'error')
        };
      }
    });
  }

  updateStatusHandler(response) {
    console.log("Drug Mapping status changed");
  }
  remove_obj(index) {
    this.drugMapping.splice(index, 1);
  }
  clearEdit() {
    this.showMappings = true;
    this.editable = false;
  }
  back() {
    this.alertMessage.confirm('Confirm', "Do you really want to cancel? Any unsaved data would be lost").subscribe(res => {
      if (res) {
        this.drugMappingForm.resetForm();
        this.clearEdit();
        this.drugMapping = [];
      }
    })
  }

  existingDrugs: any = [];
  checkExistance(stateID, drugGroupID) {
    debugger;
    this.mappedDrugs = [];
    this.drugIdList = [];
    this.existingDrugs = [];
    if (drugGroupID != undefined) {
      drugGroupID = drugGroupID.split("-")[0];
    }

    for (let availableDrugMapping of this.availableDrugMappings) {
      if (availableDrugMapping.providerServiceMapID == this.providerServiceMapID && availableDrugMapping.drugGroupID == drugGroupID) {
        // finding exsting drug group mappings with drugs
        this.mappedDrugs.push(availableDrugMapping);
        if (!availableDrugMapping.deleted) {
          this.existingDrugs.push(availableDrugMapping.drugId + "-" + availableDrugMapping.drugName);
        }
      }
    }

    console.log(this.mappedDrugs);
    this.drugIdList = this.existingDrugs;
    console.log(this.drugIdList);

  }

}