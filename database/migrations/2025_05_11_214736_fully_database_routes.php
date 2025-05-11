<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->uuid('parent_id')->nullable()->after('id');
            $table->string('path')->nullable()->after('name');
            $table->string('icon')->nullable()->after('path');
            $table->json('available_actions')->nullable()->after('description');

            $table->boolean('is_client')->default(false)->after('available_actions');

            $table->foreign('parent_id')->references('id')->on('modules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id', 'path', 'icon', 'available_actions']);
        });
    }
};
