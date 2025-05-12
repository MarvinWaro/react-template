<?php

namespace App\Attributes;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
class RoleAccess
{
    public string $module;
    public string $permission;

    public function __construct(string $module, string $permission = 'can_view')
    {
        $this->module = $module;
        $this->permission = $permission;
    }
}
