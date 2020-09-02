///
/// Copyright © 2016-2020 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Component, Inject, Input, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionNotificationShow } from '@app/core/notification/notification.actions';
import { TranslateService } from '@ngx-translate/core';
import { EntityTableConfig } from '@home/models/entity/entities-table-config.models';
import { EntityComponent } from '../entity/entity.component';
import {
  createDeviceProfileConfiguration,
  DeviceProfile,
  DeviceProfileData,
  DeviceProfileType,
  deviceProfileTypeTranslationMap
} from '@shared/models/device.models';
import { EntityType } from '@shared/models/entity-type.models';
import { RuleChainId } from '@shared/models/id/rule-chain-id';

@Component({
  selector: 'tb-device-profile',
  templateUrl: './device-profile.component.html',
  styleUrls: []
})
export class DeviceProfileComponent extends EntityComponent<DeviceProfile> {

  @Input()
  standalone = false;

  entityType = EntityType;

  deviceProfileTypes = Object.keys(DeviceProfileType);

  deviceProfileTypeTranslations = deviceProfileTypeTranslationMap;

  constructor(protected store: Store<AppState>,
              protected translate: TranslateService,
              @Optional() @Inject('entity') protected entityValue: DeviceProfile,
              @Optional() @Inject('entitiesTableConfig') protected entitiesTableConfigValue: EntityTableConfig<DeviceProfile>,
              protected fb: FormBuilder) {
    super(store, fb, entityValue, entitiesTableConfigValue);
  }

  hideDelete() {
    if (this.entitiesTableConfig) {
      return !this.entitiesTableConfig.deleteEnabled(this.entity);
    } else {
      return false;
    }
  }

  buildForm(entity: DeviceProfile): FormGroup {
    const form = this.fb.group(
      {
        name: [entity ? entity.name : '', [Validators.required]],
        type: [entity ? entity.type : '', [Validators.required]],
        profileData: [entity && !this.isAdd ? entity.profileData : {}, []],
        defaultRuleChainId: [entity && entity.defaultRuleChainId ? entity.defaultRuleChainId.id : null, []],
        description: [entity ? entity.description : '', []],
      }
    );
    form.get('type').valueChanges.subscribe(() => {
      this.deviceProfileTypeChanged(form);
    });
    this.checkIsNewDeviceProfile(entity, form);
    return form;
  }

  private checkIsNewDeviceProfile(entity: DeviceProfile, form: FormGroup) {
    if (entity && !entity.id) {
      form.get('type').patchValue(DeviceProfileType.DEFAULT, {emitEvent: true});
    }
  }

  private deviceProfileTypeChanged(form: FormGroup) {
    const deviceProfileType: DeviceProfileType = form.get('type').value;
    let profileData: DeviceProfileData = form.getRawValue().profileData;
    if (!profileData) {
      profileData = {
        configuration: null
      };
    }
    profileData.configuration = createDeviceProfileConfiguration(deviceProfileType);
    this.entityForm.patchValue({profileData});
  }

  updateForm(entity: DeviceProfile) {
    this.entityForm.patchValue({name: entity.name});
    this.entityForm.patchValue({type: entity.type});
    this.entityForm.patchValue({profileData: entity.profileData});
    this.entityForm.patchValue({defaultRuleChainId: entity.defaultRuleChainId ? entity.defaultRuleChainId.id : null});
    this.entityForm.patchValue({description: entity.description});
  }

  prepareFormValue(formValue: any): any {
    if (formValue.defaultRuleChainId) {
      formValue.defaultRuleChainId = new RuleChainId(formValue.defaultRuleChainId);
    }
    return formValue;
  }

  onDeviceProfileIdCopied(event) {
    this.store.dispatch(new ActionNotificationShow(
      {
        message: this.translate.instant('device-profile.idCopiedMessage'),
        type: 'success',
        duration: 750,
        verticalPosition: 'bottom',
        horizontalPosition: 'right'
      }));
  }

}