import * as Flex from "@twilio/flex-ui";

export default class Helpers {
  static getWorkerSkills = (worker, availableSkills) => {
    const skills = {};

    const parseSkills = (skillsAndLevel, disabled) => {
      if (Array.isArray(skillsAndLevel.skills)) {
        skillsAndLevel.skills.forEach((name) => {
          const skillFromConfig = availableSkills.find(
            (skill) => skill.name === name
          );
          skills[name] = {
            ...skillFromConfig,
            name,
            level: skillsAndLevel.levels
              ? skillsAndLevel.levels[name]
              : undefined,
            disabled: disabled,
          };
        });
      } else {
        console.warn("skills is not an array", skillsAndLevel);
      }
    };

    if (worker.attributes) {
      // current (enabled) skills
      if (worker.attributes.routing) {
        parseSkills(worker.attributes.routing, false);
      }

      // disabled skills
      if (worker.attributes.disabled_skills) {
        parseSkills(worker.attributes.disabled_skills, true);
      }
    }

    return skills;
  };

  static isSkillLevelValid = (skill) => {
    if (!skill.multivalue) {
      return true;
    }

    return skill.level >= skill.minimum && skill.level <= skill.maximum;
  };

  static request = async (path, params) => {
    const body = {
      ...params,
      Token:
        Flex.Manager.getInstance().store.getState().flex.session.ssoTokenPayload
          .token,
    };

    const options = {
      method: "POST",
      body: new URLSearchParams(body),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    };

    const { FLEX_APP_FUNCTIONS_BASE } = process.env;
      return await fetch(`${FLEX_APP_FUNCTIONS_BASE}/${path}`, options)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          return response.json();
        }
      });
  };
}
