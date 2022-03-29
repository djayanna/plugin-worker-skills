import React from "react";
import { FormHelperText, MenuItem } from "@material-ui/core";
import { templates, Template, Manager } from "@twilio/flex-ui";
import { Button, FlexBox, IconButton } from "@twilio/flex-ui-core";
import axios from "axios";
import { stringify } from "query-string";
import WorkerSkill from "./WorkerSkill";
import helpers from "../../utils/helpers";
import {
  AddPanelContainer,
  ButtonsContainer,
  LevelInputAndButtonContainer,
  NoSkillsContainer,
  NotificationTextContainer,
  RightButtonContainer,
  SkillsContainer,
  StyledSkillLevelInput,
  StyledSelect,
} from "./WorkerSkills.Styles";

const NotificationTemplate = {
    Error: "WorkerSkillsError",
    Saved: "WorkerSkillsSaved",
    Reverted: "WorkerSkillsReverted"
}

const SERVICE_URL = "https://preview.twilio.com/Flex/Worker/Instance"

const Initial_State = {
    workerSid: undefined,
    workerSkills: undefined,
    workerSkillsOriginal: undefined,
    available_skills: undefined,
    notificationTemplate: undefined
}

export default class WorkerSkills extends React.Component {
  constructor(props) {
    super();
    this.props = props;
    this.state = Initial_State;
  }


  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.worker.sid === prevState.workerSid) {
        return null;
    }

    const workerSkills = helpers.getWorkerSkills(
        nextProps.worker,
        nextProps.availableSkills
      );
  
      return {
        workerSid: nextProps.worker.sid,
        workerSkills: workerSkills,
        workerSkillsOriginal: workerSkills,
        available_skills: nextProps.availableSkills
          .map((skillDef) => ({
            ...skillDef,
            disabled: !!workerSkills[skillDef.name],
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
        notificationTemplate: undefined
      };
 }



  render() {
    const {
      current,
      workerSkills,
      workerSkillsOriginal,
      notificationTemplate,
    } = this.state;
    const { theme, availableSkills } = this.props;

    let currentLevel = "";
    if (!!current && current.level !== undefined) {
      currentLevel = String(current.level);
    }

    const available_skills = availableSkills
      .map((skillDef) => ({
        ...skillDef,
        disabled: !!workerSkills[skillDef.name],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const allSkills = Object.keys(workerSkills)
      .map((key) => workerSkills[key])
      .sort((a, b) => a.name.localeCompare(b.name));

    const changed =
      JSON.stringify(workerSkills) !== JSON.stringify(workerSkillsOriginal);
    const areAllSkillsValid = allSkills.every(helpers.isSkillLevelValid);

    const canBeAdded = !!current && helpers.isSkillLevelValid(current);

    return (
      <div>
        {/* Add Skills  */}
        <AddPanelContainer
          className="Twilio-WorkerSkills-AddSkillPanel"
          noGrow
          noShrink
          vertical
        >
          <FlexBox noGrow>
            <StyledSelect
              className="Twilio-WorkerSkills-Select"
              value={available_skills.findIndex(
                (item) => item.name === (current && current.name)
              )}
              onChange={this.handleChange}
              displayEmpty
            >
              <MenuItem value={-1} disabled>
                <Template source={templates.WorkerSkillPleaseSelect} />
              </MenuItem>
              {available_skills.map((skill, i) => (
                <MenuItem
                  key={skill.name}
                  value={i}
                  disabled={skill.disabled}
                  className={skill.disabled ? "Twilio-disabled" : ""}
                >
                  <Template code={skill.name} />
                </MenuItem>
              ))}
            </StyledSelect>
            <LevelInputAndButtonContainer vertical noGrow noShrink>
              <FlexBox noGrow noShrink>
                <StyledSkillLevelInput
                  disabled={!current || !current.multivalue}
                  error={!!current && !canBeAdded}
                  value={currentLevel}
                  placeholder={!!current && current.multivalue ? "" : "-"}
                  onChange={this.handleLevelChange}
                />
                <RightButtonContainer>
                  <IconButton
                    icon="Add"
                    themeOverride={theme.WorkerSkills.SaveButton}
                    onClick={this.handleAddClick}
                    disabled={!canBeAdded}
                  />
                </RightButtonContainer>
              </FlexBox>
              {!canBeAdded && !!current && (
                <FormHelperText>
                  <Template
                     source={templates.WorkerSkillLevelInvalid}
                     min={current.minimum}
                     max={current.maximum}
                  />
                </FormHelperText>
              )}
            </LevelInputAndButtonContainer>
          </FlexBox>
        </AddPanelContainer>

        <SkillsContainer
          key="skills-container"
          className="Twilio-WorkerSkills-SkillsContainer"
          vertical
          noGrow
        >
          {allSkills.map((skill) => (
            <WorkerSkill
              key={skill.name}
              skill={skill}
              theme={theme}
              onUpdate={this.handleSkillUpdate}
              onRemove={this.handleSkillRemove}
            />
          ))}
        </SkillsContainer>
        {allSkills.length === 0 && (
          <NoSkillsContainer
            key="no-skills"
            className="Twilio-WorkerSkills-NoSkills"
            noGrow
          >
            <Template source={templates.WorkerSkillsNoSkills}/>
          </NoSkillsContainer>
        )}

        <ButtonsContainer
          key="buttons-container"
          className="Twilio-WorkerSkills-ButtonsContainer"
          noGrow
          noShrink
        >
          <Button
            className="Twilio-WorkerSkills-SkillsSaveButton"
            disabled={!changed || !areAllSkillsValid}
            onClick={this.handleSaveClick}
            themeOverride={theme.WorkerSkills.SaveButton}
            roundCorners={false}
          >
            <Template source={templates.Save} />
          </Button>
          <Button
            className="Twilio-WorkerSkills-SkillsCancelButton"
            disabled={!changed}
            onClick={this.handleCancelClick}
            themeOverride={theme.WorkerSkills.CancelButton}
            roundCorners={false}
          >
            <Template source={templates.Reset} />
          </Button>
        </ButtonsContainer>
        {!!notificationTemplate && (
          <NotificationTextContainer
            key="notification-container"
            className="Twilio-WorkerSkills-Notification"
            noGrow
          >
            {<Template code={notificationTemplate} />}
          </NotificationTextContainer>
        )}
      </div>
    );
  }

  handleSkillSelected = (skill) => {
    this.setState({
      current: skill ? { ...skill, disabled: false } : undefined,
    });
  };

  handleLevelChange = (event) => {
    const intVal = parseInt(event.target.value, 10);
    this.setState((state) => ({
      current: {
        ...state.current,
        level: Number.isNaN(intVal) ? undefined : intVal,
      },
    }));
  };

  handleCancelClick = () => {
    this.setState((state) => ({
      workerSkills: state.workerSkillsOriginal,
      notificationTemplate: NotificationTemplate.Reverted
    }));
  };

  handleChange = (event) => {
    const skill =
      event.target.value === -1
        ? undefined
        : this.state.available_skills[event.target.value];

    this.setState({
      current: skill ? { ...skill, disabled: false } : undefined,
    });
  };

  handleAddClick = () => {
    this.handleSkillUpdate(this.state.current);
    this.setState({ current: undefined });
  };

  handleSkillUpdate = (skill) => {
    this.setState((state) => ({
      workerSkills: {
        ...state.workerSkills,
        [skill.name]: skill,
      },
    }));
  };

  handleSkillRemove = (skill) => {
    this.setState((state) => {
      const updatedSkills = { ...state.workerSkills };
      delete updatedSkills[skill.name];
      return {
        workerSkills: updatedSkills,
        notificationTemplate: undefined
      };
    });
  };

  handleSaveClick = () => {

    const attributes = this.getMergedAttributes();
    const payload = {
      Sid: this.props.worker.sid,
      WorkspaceSid:
        Manager.getInstance().serviceConfiguration.taskrouter_workspace_sid,
      Attributes: JSON.stringify(attributes),
    };
    const config = {
      auth: {
        username: "token",
        password:
          Manager.getInstance().store.getState().flex.session.ssoTokenPayload
            .token,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    console.log("updating attributes for worker", payload);
    axios
      .post(
        `${SERVICE_URL}`,
        stringify(payload),
        config
      )
      .then(() => {
        // todo:
        console.log("worker attributes updated", this.props.worker.sid);

        this.setState((state) => ({
          workerSkillsOriginal: state.workerSkills,
          notificationTemplate: NotificationTemplate.Saved
        }));
      })
      .catch((error) => {
        // todo:
        console.error("worker attributes update failed", error);
        this.setState({ notificationTemplate: NotificationTemplate.Error });
      });
  };

  getMergedAttributes() {
    const populateSkillsAttrs = (routing, disabled) => {
      const { workerSkills } = this.state;
      routing.skills = [];
      routing.levels = {};

      Object.keys(workerSkills).forEach((key) => {
        const skill = workerSkills[key];

        if (skill.disabled === disabled) {
          routing.skills.push(skill.name);
          if (skill.multivalue) {
            routing.levels[skill.name] = skill.level;
          }
        }
      });
    };

    const attrs = this.props.worker.attributes || {};
    const disabledSkills = attrs.disabled_skills || {};
    const routing = attrs.routing || {};

    populateSkillsAttrs(disabledSkills, true);
    populateSkillsAttrs(routing, false);

    const skillsUpdatedBy =
      Manager.getInstance().store.getState().flex.session.identity;
    const skillsUpdatedTimestamp = new Date().toISOString();
    return {
      ...attrs,
      routing,
      disabled_skills: disabledSkills,
      skillsUpdatedBy,
      skillsUpdatedTimestamp,
    };
  }
}
